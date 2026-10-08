import { NextResponse } from "next/server";

export const runtime = "nodejs";

/* =========================================================
   MR.A SYSTEM PROMPT
========================================================= */

const SYSTEM_PROMPT = `
You are MR.A, the AI Campaign Intelligence Engine inside ANIX AI.

Your job is to convert a user's advertising brief into a practical,
professional digital advertising campaign strategy.

You specialize in:

- Meta Ads
- Facebook Ads
- Instagram Ads
- Google Ads
- Lead Generation
- Sales
- Traffic
- Engagement
- Brand Awareness

Always respect:

- User's exact budget
- User's exact location
- User's exact campaign duration
- User's explicitly selected platform

If information is missing, intelligently recommend it.

Do not make performance guarantees.

Return ONLY valid JSON.
`;

/* =========================================================
   NORMALIZE CAMPAIGN
========================================================= */

function normalizeCampaign(campaign) {
  return {
    campaignName:
      campaign?.campaignName ||
      "AI Generated Campaign",

    platform:
      campaign?.platform ||
      "Meta Ads",

    objective:
      campaign?.objective ||
      "Leads",

    industry:
      campaign?.industry ||
      "General Business",

    location:
      campaign?.location ||
      "India",

    budget: {
      amount:
        Number(
          campaign?.budget?.amount
        ) || 0,

      currency:
        campaign?.budget?.currency ||
        "INR",

      type:
        campaign?.budget?.type ||
        "Lifetime",

      recommendedDaily:
        Number(
          campaign?.budget?.recommendedDaily
        ) || 0,
    },

    duration: {
      days:
        Number(
          campaign?.duration?.days
        ) || 1,

      unit:
        campaign?.duration?.unit ||
        "days",
    },

    targeting: {
      location:
        campaign?.targeting?.location ||
        campaign?.location ||
        "India",

      radius:
        campaign?.targeting?.radius ||
        "AI recommended",

      age:
        campaign?.targeting?.age ||
        "23–50",

      gender:
        campaign?.targeting?.gender ||
        "All",

      interests:
        Array.isArray(
          campaign?.targeting?.interests
        )
          ? campaign.targeting.interests
          : [],

      behaviors:
        Array.isArray(
          campaign?.targeting?.behaviors
        )
          ? campaign.targeting.behaviors
          : [],
    },

    placements:
      Array.isArray(
        campaign?.placements
      )
        ? campaign.placements
        : [],

    optimization:
      campaign?.optimization ||
      "Maximize campaign results",

    campaignStructure:
      Array.isArray(
        campaign?.campaignStructure
      )
        ? campaign.campaignStructure
        : [],

    creativeDirection:
      campaign?.creativeDirection ||
      "Create clear, industry-specific advertising creative.",

    adCopyDirection:
      campaign?.adCopyDirection ||
      "Use concise benefit-focused messaging with a clear call to action.",

    leadFormStrategy:
      campaign?.leadFormStrategy ||
      "Use a short lead form with essential qualification fields.",

    recommendations:
      Array.isArray(
        campaign?.recommendations
      )
        ? campaign.recommendations
        : [],

    aiNote:
      campaign?.aiNote ||
      "MR.A generated this campaign strategy using AI.",
  };
}

/* =========================================================
   EXTRACT JSON
========================================================= */

function extractJson(text) {
  if (!text) {
    throw new Error(
      "Groq returned an empty response."
    );
  }

  const cleaned = String(text)
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const firstBrace =
    cleaned.indexOf("{");

  const lastBrace =
    cleaned.lastIndexOf("}");

  if (
    firstBrace === -1 ||
    lastBrace === -1
  ) {
    throw new Error(
      "Groq did not return valid JSON."
    );
  }

  try {
    return JSON.parse(
      cleaned.slice(
        firstBrace,
        lastBrace + 1
      )
    );
  } catch (error) {
    console.error(
      "MR.A JSON PARSE ERROR:",
      cleaned
    );

    throw new Error(
      "Groq returned malformed campaign JSON."
    );
  }
}

/* =========================================================
   MODEL FILTER
========================================================= */

/*
  IMPORTANT:

  We NEVER want MR.A to automatically select:

  - Orpheus
  - Audio models
  - Whisper
  - TTS
  - Guard
  - Safety
  - Moderation
  - Embedding models

  These are not suitable for MR.A campaign generation.
*/

function isUsableTextModel(model) {
  const id = String(
    model?.id || ""
  ).toLowerCase();

  if (!id) {
    return false;
  }

  const blockedKeywords = [
    "orpheus",
    "whisper",
    "tts",
    "audio",
    "speech",
    "guard",
    "safeguard",
    "moderation",
    "moderate",
    "embedding",
    "vision",
    "compound",
  ];

  return !blockedKeywords.some(
    (keyword) =>
      id.includes(keyword)
  );
}

/* =========================================================
   SELECT MODEL
========================================================= */

function selectBestModel(models) {
  const usableModels =
    models.filter(
      isUsableTextModel
    );

  console.log(
    "MR.A → Usable text models:",
    usableModels.map(
      (model) => model.id
    )
  );

  /*
    Prefer models suitable for fast
    structured campaign generation.
  */

  const preferredModels = [
    "qwen/qwen3-8b",
    "qwen/qwen3-32b",
    "qwen/qwen3-27b",
    "qwen/qwen3.8-27b",
    "llama-3.1-8b-instant",
    "llama-3.3-70b-versatile",
    "gemma2-9b-it",
  ];

  for (
    const preferred of preferredModels
  ) {
    const match =
      usableModels.find(
        (model) =>
          model.id ===
          preferred
      );

    if (match) {
      return match.id;
    }
  }

  /*
    Generic fallback.

    IMPORTANT:
    We only choose from the already-filtered
    text models.

    Therefore Orpheus can NEVER be selected.
  */

  const fallback =
    usableModels.find(
      (model) => {
        const id =
          model.id.toLowerCase();

        return (
          id.includes("qwen") ||
          id.includes("llama") ||
          id.includes("gemma") ||
          id.includes("mixtral")
        );
      }
    );

  if (fallback) {
    return fallback.id;
  }

  /*
    Last safe fallback.
  */

  if (usableModels.length > 0) {
    return usableModels[0].id;
  }

  throw new Error(
    "No compatible Groq text-generation model is available."
  );
}

/* =========================================================
   POST
========================================================= */

export async function POST(
  request
) {
  try {
    console.log(
      "========================================"
    );

    console.log(
      "MR.A → Groq campaign request"
    );

    /* =====================================================
       REQUEST
    ===================================================== */

    const body =
      await request.json();

    const prompt =
      body?.prompt?.trim();

    if (!prompt) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Please describe what you want to achieve.",
        },
        {
          status: 400,
        }
      );
    }

    console.log(
      "MR.A → User brief:",
      prompt
    );

    /* =====================================================
       API KEY
    ===================================================== */

    const apiKey =
      process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error:
            "GROQ_API_KEY is missing from .env.local.",
        },
        {
          status: 500,
        }
      );
    }

    /* =====================================================
       USER PROMPT
    ===================================================== */

    const userPrompt = `
Create a complete advertising campaign strategy.

USER BRIEF:
${prompt}

Return EXACTLY this JSON:

{
  "campaignName": "",
  "platform": "",
  "objective": "",
  "industry": "",
  "location": "",

  "budget": {
    "amount": 0,
    "currency": "INR",
    "type": "Lifetime",
    "recommendedDaily": 0
  },

  "duration": {
    "days": 0,
    "unit": "days"
  },

  "targeting": {
    "location": "",
    "radius": "",
    "age": "",
    "gender": "",
    "interests": [],
    "behaviors": []
  },

  "placements": [],

  "optimization": "",

  "campaignStructure": [
    {
      "adSetName": "",
      "targeting": "",
      "budgetAllocation": ""
    }
  ],

  "creativeDirection": "",

  "adCopyDirection": "",

  "leadFormStrategy": "",

  "recommendations": [],

  "aiNote": ""
}

Keep the JSON concise.
Do not add markdown.
Do not add explanations outside JSON.
`;

    /* =====================================================
       GET AVAILABLE GROQ MODELS
    ===================================================== */

    console.log(
      "MR.A → Checking Groq models..."
    );

    const modelsResponse =
      await fetch(
        "https://api.groq.com/openai/v1/models",
        {
          method: "GET",

          headers: {
            Authorization:
              `Bearer ${apiKey}`,
          },

          cache: "no-store",
        }
      );

    const modelsRaw =
      await modelsResponse.text();

    if (!modelsResponse.ok) {
      console.error(
        "GROQ MODEL LIST ERROR:",
        modelsRaw
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Unable to retrieve Groq models.",
        },
        {
          status:
            modelsResponse.status,
        }
      );
    }

    let modelsData;

    try {
      modelsData =
        JSON.parse(
          modelsRaw
        );
    } catch {
      throw new Error(
        "Groq returned an invalid model list."
      );
    }

    const models =
      Array.isArray(
        modelsData?.data
      )
        ? modelsData.data
        : [];

    console.log(
      "MR.A → Groq models found:",
      models.length
    );

    /* =====================================================
       SELECT SAFE MODEL
    ===================================================== */

    const selectedModel =
      selectBestModel(
        models
      );

    console.log(
      "MR.A → Selected model:",
      selectedModel
    );

    /* =====================================================
       GROQ REQUEST
    ===================================================== */

    const groqResponse =
      await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${apiKey}`,

            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            model:
              selectedModel,

            messages: [
              {
                role: "system",

                content:
                  SYSTEM_PROMPT,
              },

              {
                role: "user",

                content:
                  userPrompt,
              },
            ],

            temperature: 0.2,

            max_tokens: 500,

            response_format: {
              type: "json_object",
            },
          }),
        }
      );

    const groqRaw =
      await groqResponse.text();

    console.log(
      "Groq HTTP STATUS:",
      groqResponse.status
    );

    /* =====================================================
       GROQ ERROR
    ===================================================== */

    if (!groqResponse.ok) {
      console.error(
        "GROQ RAW ERROR:",
        groqRaw
      );

      let message =
        "Groq request failed.";

      try {
        const parsed =
          JSON.parse(
            groqRaw
          );

        message =
          parsed?.error?.message ||
          message;
      } catch {
        // Keep default
      }

      return NextResponse.json(
        {
          success: false,

          error:
            `Groq API Error: ${message}`,
        },
        {
          status:
            groqResponse.status,
        }
      );
    }

    /* =====================================================
       PARSE RESPONSE
    ===================================================== */

    let groqData;

    try {
      groqData =
        JSON.parse(
          groqRaw
        );
    } catch {
      throw new Error(
        "Groq returned an invalid API response."
      );
    }

    const generatedText =
      groqData
        ?.choices?.[0]
        ?.message?.content
        ?.trim();

    if (!generatedText) {
      throw new Error(
        "Groq returned an empty response."
      );
    }

    console.log(
      "MR.A → Groq response received."
    );

    /* =====================================================
       JSON
    ===================================================== */

    const rawCampaign =
      extractJson(
        generatedText
      );

    /* =====================================================
       NORMALIZE
    ===================================================== */

    const campaign =
      normalizeCampaign(
        rawCampaign
      );

    /* =====================================================
       SUCCESS
    ===================================================== */

    console.log(
      "MR.A → Campaign generated successfully."
    );

    console.log(
      "Campaign:",
      campaign.campaignName
    );

    console.log(
      "Platform:",
      campaign.platform
    );

    console.log(
      "Budget:",
      campaign.budget.amount,
      campaign.budget.currency
    );

    console.log(
      "========================================"
    );

    return NextResponse.json({
      success: true,

      campaign,
    });
  } catch (error) {
    console.error(
      "MR.A GROQ SERVER ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error?.message ||
          "MR.A could not process the campaign request.",
      },
      {
        status: 500,
      }
    );
  }
}