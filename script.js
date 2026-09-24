(() => {
  "use strict";
  const root = document.documentElement;
  const themeButton = document.querySelector(".theme-toggle");
  const updateTheme = () => {
    const light = root.dataset.theme === "light";
    const label = light
      ? "Přepnout na tmavý motiv"
      : "Přepnout na světlý motiv";
    themeButton?.setAttribute("aria-label", label);
    themeButton?.setAttribute("title", label);
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", light ? "#f5f6f3" : "#10141b");
  };
  themeButton?.addEventListener("click", () => {
    root.dataset.theme = root.dataset.theme === "light" ? "dark" : "light";
    try {
      localStorage.setItem("bonesaver-theme", root.dataset.theme);
    } catch {
      /* Browsing remains functional without storage. */
    }
    updateTheme();
  });
  updateTheme();
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });

  const nav = document.querySelector(".site-nav");
  const toggle = document.querySelector(".nav-toggle");
  const closeMenu = () => {
    nav?.classList.remove("is-open");
    toggle?.setAttribute("aria-expanded", "false");
    toggle?.setAttribute("aria-label", "Otevřít menu");
    document.querySelectorAll(".nav-dropdown[open]").forEach((el) => {
      el.open = false;
    });
  };
  toggle?.addEventListener("click", () => {
    const open = !nav.classList.contains("is-open");
    closeMenu();
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Zavřít menu" : "Otevřít menu");
  });
  nav
    ?.querySelectorAll("a")
    .forEach((a) => a.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    const mobileOpen = nav?.classList.contains("is-open");
    const dropdown = document.querySelector(".nav-dropdown[open]");
    closeMenu();
    if (mobileOpen) toggle.focus();
    else dropdown?.querySelector("summary").focus();
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".site-header")) closeMenu();
  });
  window
    .matchMedia("(min-width: 1025px)")
    .addEventListener("change", closeMenu);

  document.querySelectorAll("[data-video]").forEach((frame) => {
    frame.querySelector("button")?.addEventListener("click", () => {
      if (!/^[\w-]{11}$/.test(frame.dataset.video)) return;
      const iframe = document.createElement("iframe");
      iframe.src = `https://www.youtube-nocookie.com/embed/${frame.dataset.video}?autoplay=1&rel=0`;
      iframe.title = frame.dataset.title;
      iframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      iframe.allowFullscreen = true;
      iframe.referrerPolicy = "strict-origin-when-cross-origin";
      frame.replaceChildren(iframe);
      frame.classList.add("is-playing");
      iframe.focus();
    });
  });

  const search = document.getElementById("repertoireSearch");
  if (search) {
    const normalize = (text) =>
      text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLocaleLowerCase("cs")
        .trim();
    const table = document.getElementById("songTable");
    const rows = [...table.querySelectorAll("tbody tr")].map((el) => ({
      el,
      text: normalize(el.textContent),
      genre: el.dataset.genre,
    }));
    const filters = [...document.querySelectorAll("[data-filter]")];
    const params = new URLSearchParams(location.search);
    let genre = filters.some((el) => el.dataset.filter === params.get("zanr"))
      ? params.get("zanr")
      : "all";
    search.value = params.get("q") || "";
    const filter = () => {
      const words = normalize(search.value).split(/\s+/).filter(Boolean);
      let count = 0;
      for (const row of rows) {
        const visible =
          (genre === "all" || row.genre === genre) &&
          words.every((word) => row.text.includes(word));
        row.el.hidden = !visible;
        if (visible) count++;
      }
      filters.forEach((button) =>
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.filter === genre),
        ),
      );
      document.getElementById("repertoireCount").textContent =
        `${count} / ${rows.length} skladeb`;
      document.getElementById("repertoireEmpty").hidden = count !== 0;
      table.hidden = count === 0;
    };
    search.addEventListener("input", filter);
    filters.forEach((button) =>
      button.addEventListener("click", () => {
        genre = button.dataset.filter;
        filter();
      }),
    );
    document.getElementById("resetRepertoire").addEventListener("click", () => {
      search.value = "";
      genre = "all";
      filter();
      search.focus();
    });
    filter();
  }

  const form = document.querySelector("[data-inquiry]");
  if (form) {
    const date = form.elements.eventDate;
    const unknown = form.elements.dateUnknown;
    const localToday = () => {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    };
    date.min = localToday();
    const syncDate = () => {
      date.disabled = unknown.checked;
      date.required = !unknown.checked;
      date.min = localToday();
    };
    unknown.addEventListener("change", syncDate);
    syncDate();
    const type = new URLSearchParams(location.search).get("akce");
    if (
      [...form.elements.eventType.options].some(
        (option) => option.value === type,
      )
    )
      form.elements.eventType.value = type;
    const result = document.getElementById("inquiryResult");
    const resultHeading = document.getElementById("resultHeading");
    const resultMessage = document.getElementById("resultMessage");
    const submitButton = form.querySelector("[type=submit]");
    const defaultButtonContent = submitButton.innerHTML;
    const clearResult = () => { result.hidden = true; };
    form.addEventListener("input", clearResult);
    form.addEventListener("change", clearResult);
    const showResult = (heading, message) => {
      resultHeading.textContent = heading;
      resultMessage.textContent = message;
      result.hidden = false;
      resultHeading.focus({ preventScroll: true });
      result.scrollIntoView({
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
        block: "center",
      });
    };
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (submitButton.disabled) return;
      syncDate();
      if (!form.reportValidity()) return;
      const value = (name) => form.elements[name].value.trim();
      const eventLabel = form.elements.eventType.selectedOptions[0].textContent;
      const [year, month, day] = date.value.split("-");
      const eventDate = unknown.checked
        ? "Termín ještě neznám"
        : `${day}. ${month}. ${year}`;
      const formData = new FormData();
      formData.set("access_key", value("access_key"));
      formData.set("subject", `Poptávka BoneSaver — ${eventLabel}, ${eventDate}`);
      formData.set("from_name", "BoneSaver web");
      formData.set("name", value("contactName"));
      formData.set("email", value("contactEmail"));
      formData.set("phone", value("contactPhone"));
      formData.set("event_type", eventLabel);
      formData.set("event_date", eventDate);
      formData.set("event_location", value("eventLocation"));
      formData.set("message", `Typ akce: ${eventLabel}\nTermín: ${eventDate}\nMísto: ${value("eventLocation")}\nTelefon: ${value("contactPhone") || "Neuveden"}\n\nPoznámka:\n${value("eventNotes") || "Bez další poznámky."}`);
      formData.set("botcheck", value("botcheck"));
      submitButton.disabled = true;
      submitButton.textContent = "Odesílám…";
      result.hidden = true;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      try {
        const response = await fetch(form.action, {
          method: "POST",
          body: formData,
          signal: controller.signal,
        });
        const data = await response.json();
        if (!response.ok || data.success !== true) throw new Error("Send failed");
        form.reset();
        syncDate();
        showResult("Poptávka byla odeslána.", "Děkujeme. Brzy se vám ozveme na uvedený kontakt.");
      } catch {
        showResult("Poptávku se nepodařilo odeslat.", "Zkuste to prosím znovu. Vyplněné údaje zůstaly zachované; případně nám napište přímo na bonesavermusic@gmail.com.");
      } finally {
        clearTimeout(timeout);
        submitButton.innerHTML = defaultButtonContent;
        submitButton.disabled = false;
      }
    });
    submitButton.disabled = false;
    if ("IntersectionObserver" in window)
      new IntersectionObserver(
        (entries) => {
          document.body.classList.toggle(
            "form-in-view",
            entries[0].isIntersecting,
          );
        },
        { threshold: 0.05 },
      ).observe(form);
  }
  const updateScroll = () =>
    document.body.classList.toggle("is-scrolled", window.scrollY > 500);
  window.addEventListener("scroll", updateScroll, { passive: true });
  updateScroll();
})();
