
  const phrases = [
    "I SEE YOU!",
    "Turn around",
    "I'm inside your home",
    "RUN",
    "You can't escape me",
    "em pleh",
    "I can show you the reason of life"
  ];

  const el = document.getElementById("typed");

  let phraseIndex = 0;
  let charIndex = 0;
  let typing = true;

  const typingSpeed = 70;
  const deletingSpeed = 35;
  const pauseAfterType = 900;
  const pauseAfterDelete = 250;

  // Random placement settings
  const moveEvery = 900; // ms: how often to jump to a new random spot
  const minFont = 18;    // px
  const maxFont = 72;    // px

  function setRandomSpot() {
    // Choose random font size first
    const fontSize = Math.floor(minFont + Math.random() * (maxFont - minFont + 1));
    el.style.fontSize = fontSize + "px";

    // Apply a random position but keep it on-screen
    // (We measure after font-size change; this prevents off-screen placement.)
    const padding = 12; // px margin from edges

    const w = el.offsetWidth || 200;  // fallback before first text appears
    const h = el.offsetHeight || 60;

    const maxLeft = window.innerWidth - w - padding;
    const maxTop  = window.innerHeight - h - padding;

    const left = Math.max(padding, Math.floor(padding + Math.random() * Math.max(1, maxLeft)));
    const top  = Math.max(padding, Math.floor(padding + Math.random() * Math.max(1, maxTop)));

    el.style.left = left + "px";
    el.style.top = top + "px";
  }

  // Typewriter loop
  function tick() {
    const current = phrases[phraseIndex];

    if (typing) {
      charIndex++;
      el.textContent = current.slice(0, charIndex);

      if (charIndex >= current.length) {
        typing = false;
        setTimeout(tick, pauseAfterType);
        return;
      }
      setTimeout(tick, typingSpeed);
    } else {
      charIndex--;
      el.textContent = current.slice(0, charIndex);

      if (charIndex <= 0) {
        typing = true;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        setTimeout(tick, pauseAfterDelete);
        return;
      }
      setTimeout(tick, deletingSpeed);
    }
  }

  // Start typewriter
  tick();

  // Move it around periodically
  setRandomSpot();
  setInterval(() => {
    // Only reposition after some characters are visible (optional)
    // You can remove the condition if you want it to move during typing too.
    if (el.textContent.length > 0) setRandomSpot();
  }, moveEvery);

  // Reposition on resize so it stays on-screen
  window.addEventListener("resize", setRandomSpot);
