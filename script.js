/* ===========================================================
   BMM — Eignungstest
   Likert-Skala 1–5, 7 Fragen, Live-Score, Auswertung & Breakdown
   =========================================================== */

(() => {
  "use strict";

  // ---- Fragenkatalog (Quelle: Anforderung Robert Butscher) ----
  const QUESTIONS = [
    {
      id: "q1",
      cat: "Interdisziplinäres Interesse",
      text: "Ich möchte Medien nicht nur kreativ gestalten, sondern interessiere mich auch dafür, wie sie wirtschaftlich vermarktet und strategisch gemanagt werden."
    },
    {
      id: "q2",
      cat: "Organisation & Projektmanagement",
      text: "Es macht mir Spaß, komplexe Aufgaben zu organisieren und Projekte von der Idee bis zur Umsetzung zu planen."
    },
    {
      id: "q3",
      cat: "Teamfähigkeit",
      text: "Ich arbeite gerne mit anderen zusammen und bin bereit, mich aktiv in Gruppenprojekte einzubringen."
    },
    {
      id: "q4",
      cat: "Technik & IT",
      text: "Ich habe ein grundlegendes technisches Verständnis und scheue mich nicht vor Fächern wie Medientechnik oder Wirtschaftsinformatik."
    },
    {
      id: "q5",
      cat: "Analytisches Denken (Zahlen & Recht)",
      text: "Ich bin bereit, mich neben kreativen Aufgaben auch mit mathematisch-statistischen Grundlagen und rechtlichen Rahmenbedingungen (z. B. Urheberrecht) zu beschäftigen."
    },
    {
      id: "q6",
      cat: "Kommunikation & Journalismus",
      text: "Ich bin kommunikationsstark und interessiere mich dafür, wie zielgruppenorientierte Inhalte (z. B. für PR oder Journalismus) erstellt werden."
    },
    {
      id: "q7",
      cat: "Internationalität & Sprache",
      text: "Ich bin offen für internationale Perspektiven und traue mir zu, Lehrinhalte in englischer Sprache zu bearbeiten."
    }
  ];

  const LIKERT_LABELS = [
    "Trifft gar nicht zu",
    "Trifft eher nicht zu",
    "Teils, teils",
    "Trifft eher zu",
    "Trifft voll und ganz zu"
  ];

  // ---- Auswertungsstufen ----
  // 7 Fragen × 5 = 35 max; Mindest-Touch: alle 7 berührt (Default 3 = 21).
  // Wir bewerten erst, wenn der Nutzer mindestens 1× alle Slider berührt hat
  // ODER explizit "Auswerten" klickt.
  const TIERS = [
    {
      min: 30,
      headline: "Sehr gutes Match — der BMM passt hervorragend zu dir.",
      text: "Deine Antworten zeigen ein klares Profil aus Kreativität, betriebs­wirtschaftlichem Interesse, Team- und Projektorientierung sowie Offenheit für Technik und Internationalität. Genau das ist die Mischung, auf die der Bachelor Medien­management ausgelegt ist."
    },
    {
      min: 23,
      headline: "Gutes Match — der Studiengang sollte dir Spaß machen.",
      text: "Deine Stärken decken sich gut mit dem Profil des BMM. Einzelne Bereiche kannst du im Studium gezielt ausbauen — sei es Medientechnik, statistische Methodik oder internationale Perspektive. Schau dir die Schwerpunkte an, die zu deinen stärksten Dimensionen passen."
    },
    {
      min: 16,
      headline: "Bedingt geeignet — schau noch genauer hin.",
      text: "In einigen Dimensionen passt dein Profil zum Studiengang, in anderen weniger. Das ist kein Ausschluss­kriterium — überlege, in welchen Bereichen du wachsen möchtest und wie wichtig dir die schwächer bewerteten Aspekte (z. B. Technik, Recht oder Englisch) im späteren Berufsalltag wären."
    },
    {
      min: 0,
      headline: "Vermutlich kein optimales Match.",
      text: "Deine Antworten weichen in mehreren zentralen Dimensionen vom Profil des BMM ab. Das heißt nicht, dass das Studium nicht möglich ist — aber andere Studiengänge der THWS Business School (z. B. BWL, Marken- und Medienmanagement im Master, oder ein eher technischer Studiengang) könnten besser zu dir passen. Sprich gern mit der Studien­beratung."
    }
  ];

  // ---- DOM Refs ----
  const $questions     = document.getElementById("questions");
  const $progressFill  = document.getElementById("progressFill");
  const $progressCount = document.getElementById("progressCount");
  const $progressScore = document.getElementById("progressScore");
  const $evalBtn       = document.getElementById("evalBtn");
  const $resetBtn      = document.getElementById("resetBtn");
  const $form          = document.getElementById("quizForm");
  const $result        = document.getElementById("result");
  const $resultScore   = document.getElementById("resultScore");
  const $resultHead    = document.getElementById("resultHeadline");
  const $resultText    = document.getElementById("resultText");
  const $dimList       = document.getElementById("dimList");
  const $restartBtn    = document.getElementById("restartBtn");

  // ---- State ----
  const state = QUESTIONS.map(q => ({ id: q.id, value: 3, touched: false }));

  // ---- Render Fragen ----
  function renderQuestions() {
    const frag = document.createDocumentFragment();

    QUESTIONS.forEach((q, idx) => {
      const wrap = document.createElement("div");
      wrap.className = "q";
      wrap.dataset.id = q.id;

      wrap.innerHTML = `
        <div class="q__num">0${idx + 1}</div>
        <div class="q__body">
          <span class="q__cat">${q.cat}</span>
          <p class="q__text">${q.text}</p>

          <div class="q__slider-wrap">
            <div class="q__slider">
              <div class="q__track" aria-hidden="true"></div>
              <div class="q__track-fill" aria-hidden="true"></div>
              <div class="q__ticks" aria-hidden="true">
                <span></span><span></span><span></span><span></span><span></span>
              </div>
              <input
                class="q__range"
                type="range"
                min="1" max="5" step="1" value="3"
                id="${q.id}"
                aria-label="${q.cat}: ${q.text.replace(/"/g, "'")}"
                aria-valuemin="1"
                aria-valuemax="5"
                aria-valuenow="3"
                aria-valuetext="${LIKERT_LABELS[2]}"
              />
            </div>
            <div class="q__legend">
              <span>1 — Trifft gar nicht zu</span>
              <span>5 — Trifft voll und ganz zu</span>
            </div>
            <div class="q__value" aria-live="polite">
              <strong>3</strong>
              <span>${LIKERT_LABELS[2]}</span>
            </div>
          </div>
        </div>
      `;
      frag.appendChild(wrap);
    });

    $questions.appendChild(frag);
  }

  // ---- Slider-Bindings ----
  function bindSliders() {
    document.querySelectorAll(".q").forEach((qEl, idx) => {
      const range    = qEl.querySelector(".q__range");
      const fill     = qEl.querySelector(".q__track-fill");
      const valueChip= qEl.querySelector(".q__value");

      const update = (markTouched) => {
        const val = Number(range.value);
        const pct = ((val - 1) / 4) * 100;

        fill.style.width = pct + "%";
        valueChip.querySelector("strong").textContent = val;
        valueChip.querySelector("span").textContent   = LIKERT_LABELS[val - 1];

        range.setAttribute("aria-valuenow", val);
        range.setAttribute("aria-valuetext", LIKERT_LABELS[val - 1]);

        state[idx].value = val;
        if (markTouched) {
          state[idx].touched = true;
          qEl.classList.add("is-touched");
        }
        updateProgress();
      };

      range.addEventListener("input",  () => update(true));
      range.addEventListener("change", () => update(true));
      // Tastatursteuerung wird via "input" abgedeckt
      // initial styling
      update(false);
    });
  }

  // ---- Progress + Live Score ----
  function updateProgress() {
    const touched = state.filter(s => s.touched).length;
    const score   = state.reduce((sum, s) => sum + (s.touched ? s.value : 0), 0);
    const max     = QUESTIONS.length * 5;

    $progressCount.textContent = `${touched}\u00A0/\u00A0${QUESTIONS.length} beantwortet`;
    $progressScore.textContent = `Score: ${score}\u00A0/\u00A0${max}`;
    $progressFill.style.width  = (touched / QUESTIONS.length * 100) + "%";

    $evalBtn.disabled = touched < QUESTIONS.length;
    $evalBtn.style.opacity = $evalBtn.disabled ? "0.4" : "1";
    $evalBtn.style.cursor  = $evalBtn.disabled ? "not-allowed" : "pointer";
  }

  // ---- Auswertung ----
  function evaluate() {
    // Falls der Nutzer ohne Berührung "Auswerten" klickt: alle als "touched" werten.
    state.forEach((s, i) => {
      if (!s.touched) {
        s.touched = true;
        document.querySelectorAll(".q")[i].classList.add("is-touched");
      }
    });

    const total = state.reduce((sum, s) => sum + s.value, 0);
    const tier  = TIERS.find(t => total >= t.min);

    $resultScore.textContent = total;
    $resultHead.textContent  = tier.headline;
    $resultText.textContent  = tier.text;

    // Breakdown nach Dimensionen
    $dimList.innerHTML = "";
    QUESTIONS.forEach((q, i) => {
      const v   = state[i].value;
      const pct = (v / 5) * 100;
      const li  = document.createElement("li");
      li.className = "dim-row";
      li.dataset.strong = v >= 4 ? "true" : "false";
      li.innerHTML = `
        <span class="dim-row__name">${q.cat}</span>
        <span class="dim-row__bar"><span style="width:${pct}%"></span></span>
        <span class="dim-row__val">${v}<span style="opacity:.5">/5</span></span>
      `;
      $dimList.appendChild(li);
    });

    $result.hidden = false;
    // Smooth scroll into view
    requestAnimationFrame(() => {
      $result.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  // ---- Reset ----
  function resetQuiz() {
    state.forEach((s, i) => {
      s.value = 3; s.touched = false;
      const qEl = document.querySelectorAll(".q")[i];
      qEl.classList.remove("is-touched");
      const range = qEl.querySelector(".q__range");
      range.value = 3;
      qEl.querySelector(".q__track-fill").style.width = "50%";
      qEl.querySelector(".q__value strong").textContent = "3";
      qEl.querySelector(".q__value span").textContent   = LIKERT_LABELS[2];
    });
    $result.hidden = true;
    updateProgress();
    document.getElementById("eignungstest").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // ---- Init ----
  function init() {
    renderQuestions();
    bindSliders();
    updateProgress();

    $evalBtn.addEventListener("click", evaluate);
    $resetBtn.addEventListener("click", (e) => {
      e.preventDefault();
      resetQuiz();
    });
    $restartBtn.addEventListener("click", resetQuiz);

    // Form submit (Enter) -> evaluate
    $form.addEventListener("submit", (e) => {
      e.preventDefault();
      evaluate();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
