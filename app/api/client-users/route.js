import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "../../../lib/firebase-admin";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    // Get request data
    const body = await request.json();

    const {
      name,
      email,
      password,
      clientId,
      clientName,
      role,
      status,
    } = body;

    // Basic validation
    if (!name || !email || !password || !clientId || !role) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, email, password, client and role are required.",
        },
        { status: 400 }
      );
    }

    // Get Firebase ID token from request
    const authorization = request.headers.get("authorization");

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required.",
        },
        { status: 401 }
      );
    }

    const idToken = authorization.split("Bearer ")[1];

    // Verify logged-in Firebase user
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    // Get current admin's Firestore profile
    const adminUserDoc = await adminDb
      .collection("users")
      .doc(decodedToken.uid)
      .get();

    if (!adminUserDoc.exists) {
      return NextResponse.json(
        {
          success: false,
          message: "Admin profile not found.",
        },
        { status: 403 }
      );
    }

    const adminUser = adminUserDoc.data();

    // Only agency admin can create client users
    if (
      adminUser.role !== "admin" ||
      adminUser.status !== "active"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "You do not have permission to create client users.",
        },
        { status: 403 }
      );
    }

    // Create Firebase Authentication account
    const newUser = await adminAuth.createUser({
      email: email.trim().toLowerCase(),
      password,
      displayName: name.trim(),
      disabled: status === "Inactive",
    });

    // Create Firestore user profile
    await adminDb
      .collection("users")
      .doc(newUser.uid)
      .set({
        uid: newUser.uid,
        name: name.trim(),
        email: email.trim().toLowerCase(),

        // Identifies this as a client-side user
        accountType: "client",

        clientId: clientId,
        clientName: clientName || "",

        role: role.toLowerCase(),
        status: status === "Inactive" ? "inactive" : "active",

        createdAt: new Date(),
        createdBy: decodedToken.uid,
      });

    return NextResponse.json(
      {
        success: true,
        message: "Client user created successfully.",
        user: {
          uid: newUser.uid,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          clientId,
          clientName: clientName || "",
          role: role.toLowerCase(),
          status: status === "Inactive" ? "inactive" : "active",
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create client user error:", error);

    // Firebase duplicate email
    if (error.code === "auth/email-already-exists") {
      return NextResponse.json(
        {
          success: false,
          message: "This email address is already registered.",
        },
        { status: 409 }
      );
    }

    // Invalid password
    if (error.code === "auth/password-does-not-meet-requirements") {
      return NextResponse.json(
        {
          success: false,
          message: "Password does not meet Firebase requirements.",
        },
        { status: 400 }
      );
    }

    // Invalid / expired login token
    if (
      error.code === "auth/id-token-expired" ||
      error.code === "auth/argument-error"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Your login session is invalid. Please sign in again.",
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Unable to create client user.",
      },
      { status: 500 }
    );
  }
}