const $ = (id) => document.getElementById(id);
const steps = [...document.querySelectorAll(".step")];
const panels = [...document.querySelectorAll(".step-panel")];
let currentStep = 0;

function showStep(index) {
  currentStep = Math.max(0, Math.min(2, index));
  steps.forEach((el, i) => el.classList.toggle("active", i === currentStep));
  panels.forEach((el, i) => el.classList.toggle("active", i === currentStep));
  window.scrollTo({ top: document.querySelector(".step-nav").offsetTop - 18, behavior: "smooth" });
}
steps.forEach((el) => el.addEventListener("click", () => showStep(Number(el.dataset.step))));
document.querySelectorAll(".next-btn").forEach((el) => el.addEventListener("click", () => {
  if (currentStep === 0 && !$("audience").value.trim()) {
    $("audience").focus();
    $("audience").setCustomValidity("مخاطب هدف را وارد کن.");
    $("audience").reportValidity();
    $("audience").setCustomValidity("");
    return;
  }
  showStep(currentStep + 1);
}));
document.querySelectorAll(".back-btn").forEach((el) => el.addEventListener("click", () => showStep(currentStep - 1)));

function makeValueProp() {
  const project = $("project").value.trim() || "پروژه شما";
  const audience = $("audience").value.trim() || "[مخاطب هدف]";
  const problem = $("problem").value.trim() || "[مسئله اصلی]";
  const solution = $("solution").value.trim() || "[راه‌حل]";
  const benefit = $("benefit").value.trim() || "[مزیت مشخص]";
  $("valuePreview").textContent = `برای ${audience} که با ${problem} روبه‌روست، ${project} با ارائه ${solution} کمک می‌کند به ${benefit} برسد.`;
  $("ctaPreview").textContent = $("cta").value.trim() || "اقدام بعدی";
}
["project","audience","problem","solution","benefit","cta"].forEach(id => $(id).addEventListener("input", makeValueProp));
$("copyValue").addEventListener("click", async () => {
  const text = `${$("valuePreview").textContent}\nCTA: ${$("ctaPreview").textContent}`;
  try {
    await navigator.clipboard.writeText(text);
    $("copyValue").textContent = "کپی شد ✓";
    setTimeout(() => $("copyValue").textContent = "کپی متن", 1500);
  } catch {
    const area = document.createElement("textarea");
    area.value = text; document.body.appendChild(area); area.select(); document.execCommand("copy"); area.remove();
    $("copyValue").textContent = "کپی شد ✓";
  }
});

function number(id) { return Math.max(0, Number($(id).value) || 0); }
function formatNumber(n) { return Math.round(n).toLocaleString("en-US"); }
function updateMetrics() {
  const visitors = number("visitors"), leads = number("leads"), spend = number("spend"), customers = number("customers");
  const conversion = visitors ? leads / visitors * 100 : 0;
  const cpl = leads ? spend / leads : 0;
  const close = leads ? customers / leads * 100 : 0;
  $("conversion").textContent = conversion.toFixed(1) + "%";
  $("cpl").textContent = formatNumber(cpl);
  $("closeRate").textContent = close.toFixed(1) + "%";
  let insight = "برای شروع، روی کیفیت پیام و تناسب مخاطب تمرکز کن.";
  if (!visitors) insight = "برای محاسبه نرخ تبدیل، تعداد بازدیدکننده را بیشتر از صفر وارد کن.";
  else if (!leads) insight = "فعلاً لید ثبت نشده است؛ پیشنهاد ارزش، فرم تماس و تناسب ترافیک را بررسی کن.";
  else if (conversion < 2) insight = "نرخ تبدیل پایین است؛ تیتر، وضوح پیشنهاد و هماهنگی پیام تبلیغ با صفحه فرود را آزمایش کن.";
  else if (close < 10) insight = "تبدیل لید به مشتری پایین است؛ کیفیت سرنخ‌ها، سرعت پیگیری و پیشنهاد فروش را بررسی کن.";
  else insight = "یک نتیجه امیدوارکننده اولیه است؛ آزمایش را با نمونه بزرگ‌تر تکرار کن و قبل از نتیجه‌گیری قطعی، کیفیت لیدها را بررسی کن.";
  $("insight").textContent = insight;
}
["visitors","leads","spend","customers"].forEach(id => $(id).addEventListener("input", updateMetrics));

$("exportBtn").addEventListener("click", () => {
  const report = {
    project: $("project").value,
    audience: $("audience").value,
    problem: $("problem").value,
    hypothesis: $("hypothesis").value,
    solution: $("solution").value,
    benefit: $("benefit").value,
    callToAction: $("cta").value,
    metrics: {
      visitors: number("visitors"), leads: number("leads"), spendToman: number("spend"), customers: number("customers"),
      visitorToLeadRate: $("conversion").textContent,
      costPerLeadToman: $("cpl").textContent,
      leadToCustomerRate: $("closeRate").textContent
    },
    generatedAt: new Date().toISOString(),
    note: "این خروجی یک ابزار برنامه‌ریزی است و نتایج آن به صحت داده‌های واردشده وابسته است."
  };
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = "launchkit-experiment.json"; a.click();
  URL.revokeObjectURL(url);
});
makeValueProp(); updateMetrics();
