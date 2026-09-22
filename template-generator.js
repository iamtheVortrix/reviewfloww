/* ============================================================
   NFC REVIEW TOOL — offline fallback review generator.
   Pure JavaScript, no network, no AI. Used automatically when
   the backend's AI call fails (rate limit, outage, offline).
   ============================================================ */

function generateTemplateReview(businessName, questions, answers) {
  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  var ratings = [];
  var loved = [];

  (questions || []).forEach(function (q) {
    var a = answers ? answers[q.id] : undefined;
    if (a === undefined || a === null) return;
    if (q.type === "rating" && typeof a === "number") {
      ratings.push(a);
    } else if (Array.isArray(a)) {
      a.forEach(function (x) { if (x) loved.push(x); });
    } else if (typeof a === "string" && a.trim()) {
      loved.push(a.trim());
    }
  });

  var avg = ratings.length
    ? ratings.reduce(function (s, v) { return s + v; }, 0) / ratings.length
    : 4;

  var name = businessName || "this place";
  var opener, closer;

  if (avg >= 4.5) {
    opener = pick([
      "Had a genuinely great time at " + name + ".",
      name + " really impressed me.",
      "Easily one of the better spots I've been to recently — " + name + " delivers.",
      "What a find. " + name + " exceeded my expectations."
    ]);
    closer = pick([
      "Will definitely be coming back.",
      "Highly recommended if you're in the area.",
      "Can't wait to visit again soon.",
      "Already planning my next visit."
    ]);
  } else if (avg >= 3.5) {
    opener = pick([
      "Had a good experience at " + name + ".",
      "Visited " + name + " recently and it was a solid experience overall.",
      "Pleasant visit to " + name + "."
    ]);
    closer = pick([
      "Worth a visit.",
      "I'd happily come back.",
      "A good option in the neighbourhood.",
      "Glad I stopped by."
    ]);
  } else {
    opener = pick([
      "Visited " + name + " — a decent experience overall.",
      name + " was alright, with a few good moments."
    ]);
    closer = pick([
      "Worth trying once.",
      "Has potential — hoping it gets even better."
    ]);
  }

  var parts = [opener];

  if (loved.length) {
    var items = loved.slice(0, 3);
    var list =
      items.length > 1
        ? items.slice(0, -1).join(", ") + " and " + items[items.length - 1]
        : items[0];
    parts.push(
      pick([
        "Really liked the " + list + ".",
        "The " + list + " stood out for me.",
        "Big plus for the " + list + ".",
        "Loved the " + list + " here."
      ])
    );
  }

  parts.push(closer);
  return parts.join(" ");
}

// Allow quick testing with: node template-generator.js
if (typeof module !== "undefined" && module.exports) {
  module.exports = { generateTemplateReview };
}
