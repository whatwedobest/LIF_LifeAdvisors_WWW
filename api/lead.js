const BOARD_ID = 18436583382;
const GROUP_ID = "topics";
const SOURCE = "lifead.com 2026 website";
const MONDAY_API = "https://api.monday.com/v2";
const API_VERSION = "2024-10";
const VISITOR_ERROR = "We could not send your request. Please call (888) 511-6259.";

const COL = {
  status: "color_mm8cw48j",
  first: "text_mm8cpdqn",
  last: "text_mm8c17gx",
  phone: "phone_mm8cbgqt",
  email: "email_mm8cqg3t",
  business: "text_mm8cz7a4",
  mcaCount: "dropdown_mm8cwknp",
  state: "dropdown_mm8c4d2n",
  industry: "dropdown_mm8cs0tz",
  revenue: "dropdown_mm8c6r8h",
  balance: "dropdown_mm8cmqw1",
  current: "dropdown_mm8csz99",
  contactTime: "dropdown_mm8cae7",
  message: "long_text_mm8cfbsw",
  smsConsent: "boolean_mm8cr0ra",
  smsStatus: "dropdown_mm8ctvf6",
  contactConsent: "boolean_mm8c521",
  formLocation: "dropdown_mm8ccber",
  source: "text_mm8cwwf6",
  submittedAt: "date_mm8c8dxx",
  utmSource: "text_mm8c1cf9",
  utmMedium: "text_mm8ceyz1",
  utmCampaign: "text_mm8cg7b4",
  utmContent: "text_mm8cvm6d",
  utmTerm: "text_mm8cw9m3"
};

const MCA_COUNT = ["1", "2", "3", "4 or more", "Unsure"];
const STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA", "HI", "ID",
  "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO",
  "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA",
  "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];
const INDUSTRY = [
  "Restaurant / Food Service",
  "Trucking / Transportation",
  "General Contractor / Construction",
  "Healthcare",
  "Retail",
  "Professional Services",
  "Other"
];
const MONEY = [
  "Under $25,000",
  "$25,000–$75,000",
  "$75,000–$150,000",
  "$150,000–$300,000",
  "$300,000+",
  "Unsure"
];
const CURRENT = ["Yes", "No", "Some are current", "Unsure"];
const CONTACT_TIME = ["Morning", "Afternoon", "Evening", "Anytime"];
const SMS_STATUS = ["verified", "skipped", "idle"];
const FORM_LOCATION = ["contact", "lp_before_another_mca", "lp_mca_lifeline"];

function trim(value, max) {
  return String(value || "").trim().slice(0, max);
}

function oneOf(value, allowed) {
  return allowed.includes(value) ? value : null;
}

function moneyOption(value) {
  const normalized = String(value || "").trim().replace(/-/g, "\u2013");
  return oneOf(normalized, MONEY);
}

function phoneE164(value) {
  const digits = String(value || "").replace(/\D/g, "");
  const ten = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  if (!/^[2-9]\d{2}[2-9]\d{6}$/.test(ten)) return null;
  return `+1${ten}`;
}

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

function fail(res, status, logMessage, visitorMessage) {
  console.error(logMessage);
  return json(res, status, { ok: false, error: visitorMessage });
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { ok: false, error: VISITOR_ERROR });
  }

  const token = process.env.MONDAY_API_TOKEN;
  if (!token) {
    return fail(res, 503, "MONDAY_API_TOKEN is not set", VISITOR_ERROR);
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = null; }
  }
  if (!body || typeof body !== "object") {
    return fail(res, 400, "lead: missing or invalid JSON body", VISITOR_ERROR);
  }

  if (trim(body.company_url, 200)) {
    return json(res, 200, { ok: true });
  }

  const first = trim(body.first, 80);
  const last = trim(body.last, 80);
  const business = trim(body.business, 120);
  const email = trim(body.email, 254).toLowerCase();
  const phone = phoneE164(body.phone);
  const mcaCount = oneOf(trim(body.mcaCount || body["mca-count"], 40), MCA_COUNT);
  const state = oneOf(trim(body.state, 2).toUpperCase(), STATES);
  const industry = oneOf(trim(body.industry, 80), INDUSTRY);
  const revenue = moneyOption(body.revenue);
  const balance = moneyOption(body.balance);
  const current = oneOf(trim(body.current, 40), CURRENT);
  const contactTime = oneOf(trim(body.contactTime || body["contact-time"], 40), CONTACT_TIME);
  const formLocation = oneOf(trim(body.formLocation, 40), FORM_LOCATION);
  // Launch: always record SMS as skipped while verification UI is hidden on forms.
  const smsStatus = "skipped";
  const message = trim(body.message, 4000);
  const smsConsent = false;
  const contactConsent = Boolean(body.contactConsent);

  if (!contactConsent) {
    return fail(res, 400, "lead: contact consent missing", "Please agree to be contacted, or call (888) 511-6259.");
  }
  if (!phone || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return fail(res, 400, "lead: invalid phone or email", "Please check your phone and email, or call (888) 511-6259.");
  }
  if (!first || !last || !business || !mcaCount || !state || !industry || !revenue || !balance || !current || !contactTime || !formLocation) {
    return fail(res, 400, "lead: missing required field", "Please complete every required field, or call (888) 511-6259.");
  }

  const now = new Date();
  const columnValues = {
    [COL.status]: { label: "New Submission" },
    [COL.first]: first,
    [COL.last]: last,
    [COL.phone]: { phone, countryShortName: "US" },
    [COL.email]: { email, text: email },
    [COL.business]: business,
    [COL.mcaCount]: { labels: [mcaCount] },
    [COL.state]: { labels: [state] },
    [COL.industry]: { labels: [industry] },
    [COL.revenue]: { labels: [revenue] },
    [COL.balance]: { labels: [balance] },
    [COL.current]: { labels: [current] },
    [COL.contactTime]: { labels: [contactTime] },
    [COL.smsStatus]: { labels: [smsStatus] },
    [COL.contactConsent]: { checked: "true" },
    [COL.formLocation]: { labels: [formLocation] },
    [COL.source]: SOURCE,
    [COL.submittedAt]: {
      date: now.toISOString().slice(0, 10),
      time: now.toISOString().slice(11, 19)
    }
  };

  if (message) columnValues[COL.message] = { text: message };
  if (smsConsent) columnValues[COL.smsConsent] = { checked: "true" };

  const utm = {
    [COL.utmSource]: trim(body.utm_source, 200),
    [COL.utmMedium]: trim(body.utm_medium, 200),
    [COL.utmCampaign]: trim(body.utm_campaign, 200),
    [COL.utmContent]: trim(body.utm_content, 200),
    [COL.utmTerm]: trim(body.utm_term, 200)
  };
  Object.entries(utm).forEach(([id, value]) => {
    if (value) columnValues[id] = value;
  });

  const itemName = `${business} — ${first} ${last}`.slice(0, 200);
  const query = `
    mutation ($boardId: ID!, $groupId: String, $name: String!, $cv: JSON!) {
      create_item(board_id: $boardId, group_id: $groupId, item_name: $name, column_values: $cv) { id }
    }
  `;

  try {
    const mondayRes = await fetch(MONDAY_API, {
      method: "POST",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
        "API-Version": API_VERSION
      },
      body: JSON.stringify({
        query,
        variables: {
          boardId: String(BOARD_ID),
          groupId: GROUP_ID,
          name: itemName,
          cv: JSON.stringify(columnValues)
        }
      })
    });

    const payload = await mondayRes.json();
    const itemId = payload?.data?.create_item?.id;
    if (!mondayRes.ok || payload?.errors?.length || !itemId) {
      return fail(
        res,
        502,
        `monday create_item failed ${mondayRes.status} ${payload?.errors?.[0]?.message || "no item id"}`,
        VISITOR_ERROR
      );
    }

    return json(res, 200, { ok: true });
  } catch (err) {
    return fail(res, 502, `monday create_item error ${err?.message || "unknown"}`, VISITOR_ERROR);
  }
};
