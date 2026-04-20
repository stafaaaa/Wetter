const STORAGE_KEY = "kiosk-dashboard-v1";

const defaultState = {
  editMode: false,
  weather: {
    locationName: "Berlin",
    coords: null,
    current: null,
    forecast: [],
    useMock: true
  },
  calendarEvents: [
    { id: crypto.randomUUID(), title: "Family Dinner", date: "2026-04-10", time: "19:00" },
    { id: crypto.randomUUID(), title: "Gym", date: "2026-04-11", time: "08:00" }
  ],
  slideshow: {
    images: [],
    intervalSec: 45,
    index: 0
  },
  spotify: {
    connected: false,
    isPlaying: false,
    currentIndex: 0,
    tracks: [
      { title: "Sunset Drive", artist: "Neon Coast" },
      { title: "Ambient Focus", artist: "Cloud Atlas" },
      { title: "Saturday Kitchen", artist: "Luma" }
    ]
  },
  theme: {
    bgColor: "#0f1218",
    tileColor: "#212632",
    tileAlpha: 0.72,
    textColor: "#f5f7fc",
    fontScale: 1
  },
  layout: {
    weather: { col: 1, spanCol: 4, row: 1, spanRow: 4 },
    calendar: { col: 5, spanCol: 5, row: 1, spanRow: 6 },
    clock: { col: 10, spanCol: 3, row: 1, spanRow: 3 },
    slideshow: { col: 1, spanCol: 6, row: 5, spanRow: 4 },
    spotify: { col: 7, spanCol: 6, row: 7, spanRow: 2 }
  },
  tileStyle: {
    weather: { color: "#212632" },
    calendar: { color: "#212632" },
    clock: { color: "#212632" },
    slideshow: { color: "#212632" },
    spotify: { color: "#212632" }
  },
  clock: {
    showDate: true
  }
};

let state = loadState();
let slideTimer = null;

const dom = {
  dashboard: document.getElementById("dashboard"),
  grid: document.getElementById("grid"),
  editToggle: document.getElementById("editToggle"),
  themeBtn: document.getElementById("themeBtn"),
  themePanel: document.getElementById("themePanel"),
  closeThemePanel: document.getElementById("closeThemePanel"),
  tileColor: document.getElementById("tileColor"),
  textColor: document.getElementById("textColor"),
  bgColor: document.getElementById("bgColor"),
  tileAlpha: document.getElementById("tileAlpha"),
  fontScale: document.getElementById("fontScale"),
  weatherIcon: document.getElementById("weatherIcon"),
  weatherTemp: document.getElementById("weatherTemp"),
  weatherDesc: document.getElementById("weatherDesc"),
  weatherLocation: document.getElementById("weatherLocation"),
  forecast: document.getElementById("forecast"),
  calendarTitle: document.getElementById("calendarTitle"),
  calendarGrid: document.getElementById("calendarGrid"),
  eventList: document.getElementById("eventList"),
  addEventBtn: document.getElementById("addEventBtn"),
  eventModal: document.getElementById("eventModal"),
  eventForm: document.getElementById("eventForm"),
  cancelEventBtn: document.getElementById("cancelEventBtn"),
  eventModalTitle: document.getElementById("eventModalTitle"),
  eventId: document.getElementById("eventId"),
  eventTitle: document.getElementById("eventTitle"),
  eventDate: document.getElementById("eventDate"),
  eventTime: document.getElementById("eventTime"),
  showDateToggle: document.getElementById("showDateToggle"),
  clockTime: document.getElementById("clockTime"),
  clockDate: document.getElementById("clockDate"),
  imageInput: document.getElementById("imageInput"),
  slideImage: document.getElementById("slideImage"),
  slideEmpty: document.getElementById("slideEmpty"),
  slideInterval: document.getElementById("slideInterval"),
  slideIntervalLabel: document.getElementById("slideIntervalLabel"),
  spotifyTrack: document.getElementById("spotifyTrack"),
  spotifyArtist: document.getElementById("spotifyArtist"),
  spotifyPlay: document.getElementById("spotifyPlay"),
  spotifyPrev: document.getElementById("spotifyPrev"),
  spotifyNext: document.getElementById("spotifyNext"),
  spotifyOpenBtn: document.getElementById("spotifyOpenBtn"),
  spotifyPlaylist: document.getElementById("spotifyPlaylist")
};

init();

function init() {
  applyTheme();
  applyLayout();
  wireThemeControls();
  wireCalendar();
  wireClock();
  wireSlideshow();
  wireSpotify();
  wireEditMode();
  renderCalendar();
  tickClock();
  setInterval(tickClock, 1000);
  renderSpotify();
  refreshWeather();
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(defaultState);
    return mergeDeep(structuredClone(defaultState), JSON.parse(raw));
  } catch {
    return structuredClone(defaultState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function mergeDeep(target, source) {
  for (const key of Object.keys(source || {})) {
    if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
      target[key] = mergeDeep(target[key] || {}, source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

function applyTheme() {
  document.documentElement.style.setProperty("--bg-color", state.theme.bgColor);
  document.documentElement.style.setProperty("--text-color", state.theme.textColor);
  document.documentElement.style.setProperty("--tile-alpha", String(state.theme.tileAlpha));
  document.documentElement.style.setProperty("--font-scale", String(state.theme.fontScale));
  document.documentElement.style.setProperty("--tile-rgb", hexToRgbCsv(state.theme.tileColor));

  dom.tileColor.value = state.theme.tileColor;
  dom.textColor.value = state.theme.textColor;
  dom.bgColor.value = state.theme.bgColor;
  dom.tileAlpha.value = String(state.theme.tileAlpha);
  dom.fontScale.value = String(state.theme.fontScale);

  document.querySelectorAll(".tile").forEach((tile) => {
    const tileName = tile.dataset.tile;
    const custom = state.tileStyle[tileName]?.color;
    if (custom) {
      tile.style.background = `rgba(${hexToRgbCsv(custom)}, ${state.theme.tileAlpha})`;
    }
  });
}

function wireThemeControls() {
  dom.themeBtn.addEventListener("click", () => dom.themePanel.classList.add("open"));
  dom.closeThemePanel.addEventListener("click", () => dom.themePanel.classList.remove("open"));

  dom.tileColor.addEventListener("input", () => {
    state.theme.tileColor = dom.tileColor.value;
    Object.keys(state.tileStyle).forEach((key) => {
      state.tileStyle[key].color = dom.tileColor.value;
    });
    applyTheme();
    saveState();
  });

  dom.textColor.addEventListener("input", () => {
    state.theme.textColor = dom.textColor.value;
    applyTheme();
    saveState();
  });

  dom.bgColor.addEventListener("input", () => {
    state.theme.bgColor = dom.bgColor.value;
    applyTheme();
    saveState();
  });

  dom.tileAlpha.addEventListener("input", () => {
    state.theme.tileAlpha = Number(dom.tileAlpha.value);
    applyTheme();
    saveState();
  });

  dom.fontScale.addEventListener("input", () => {
    state.theme.fontScale = Number(dom.fontScale.value);
    applyTheme();
    saveState();
  });

  document.querySelectorAll("[data-open-config]").forEach((btn) => {
    btn.addEventListener("click", (event) => {
      const tileName = event.currentTarget.dataset.openConfig;
      const picked = prompt("Set tile color (#RRGGBB)", state.tileStyle[tileName]?.color || "#212632");
      if (picked && /^#([0-9a-fA-F]{6})$/.test(picked)) {
        state.tileStyle[tileName].color = picked;
        saveState();
        applyTheme();
      }
    });
  });
}

function applyLayout() {
  for (const [tileName, placement] of Object.entries(state.layout)) {
    const tile = document.getElementById(`tile-${tileName}`);
    if (!tile) continue;
    tile.style.gridColumn = `${placement.col} / span ${placement.spanCol}`;
    tile.style.gridRow = `${placement.row} / span ${placement.spanRow}`;
  }
}

function wireEditMode() {
  dom.editToggle.addEventListener("click", () => {
    state.editMode = !state.editMode;
    dom.editToggle.textContent = state.editMode ? "Exit Edit" : "Edit Mode";
    document.querySelectorAll(".tile").forEach((tile) => {
      tile.classList.toggle("editing", state.editMode);
      tile.draggable = state.editMode;
      tile.style.resize = state.editMode ? "both" : "none";
      tile.style.overflow = state.editMode ? "auto" : "hidden";
    });
    saveState();
  });

  document.querySelectorAll(".tile").forEach((tile) => {
    tile.addEventListener("dragstart", (event) => {
      if (!state.editMode) return;
      event.dataTransfer.setData("text/plain", tile.dataset.tile);
    });

    tile.addEventListener("dragover", (event) => {
      if (state.editMode) event.preventDefault();
    });

    tile.addEventListener("drop", (event) => {
      if (!state.editMode) return;
      event.preventDefault();
      const from = event.dataTransfer.getData("text/plain");
      const to = tile.dataset.tile;
      if (!from || from === to) return;
      const fromLayout = state.layout[from];
      state.layout[from] = state.layout[to];
      state.layout[to] = fromLayout;
      applyLayout();
      saveState();
    });

    tile.addEventListener("pointerup", () => {
      if (!state.editMode) return;
      const style = window.getComputedStyle(tile);
      const colStart = Number(style.gridColumnStart);
      const rowStart = Number(style.gridRowStart);
      const colEnd = style.gridColumnEnd;
      const rowEnd = style.gridRowEnd;
      const spanCol = Number(String(colEnd).replace("span ", "")) || state.layout[tile.dataset.tile].spanCol;
      const spanRow = Number(String(rowEnd).replace("span ", "")) || state.layout[tile.dataset.tile].spanRow;
      state.layout[tile.dataset.tile] = { col: colStart, spanCol, row: rowStart, spanRow };
      saveState();
    });
  });
}

async function refreshWeather() {
  // Integration point: replace with your chosen weather provider and API key/OAuth flow.
  const mock = {
    icon: "⛅",
    temp: 18,
    desc: "Partly cloudy",
    location: "Berlin",
    forecast: [
      { day: "Fri", icon: "🌤", min: 12, max: 20 },
      { day: "Sat", icon: "🌦", min: 10, max: 16 },
      { day: "Sun", icon: "☁️", min: 11, max: 17 },
      { day: "Mon", icon: "🌧", min: 9, max: 14 },
      { day: "Tue", icon: "☀️", min: 10, max: 19 }
    ]
  };

  try {
    const position = await getCurrentPosition();
    state.weather.coords = {
      lat: position.coords.latitude,
      lon: position.coords.longitude
    };

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${state.weather.coords.lat}&longitude=${state.weather.coords.lon}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Weather API unavailable");
    const data = await response.json();

    state.weather.useMock = false;
    state.weather.current = {
      temp: Math.round(data.current.temperature_2m),
      code: data.current.weather_code
    };

    state.weather.forecast = data.daily.time.slice(0, 5).map((day, idx) => {
      const date = new Date(day);
      const code = data.daily.weather_code[idx];
      return {
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        icon: weatherCodeToIcon(code),
        min: Math.round(data.daily.temperature_2m_min[idx]),
        max: Math.round(data.daily.temperature_2m_max[idx])
      };
    });

    dom.weatherIcon.textContent = weatherCodeToIcon(state.weather.current.code);
    dom.weatherTemp.textContent = `${state.weather.current.temp}°`;
    dom.weatherDesc.textContent = weatherCodeToText(state.weather.current.code);
    dom.weatherLocation.textContent = `Lat ${state.weather.coords.lat.toFixed(2)}, Lon ${state.weather.coords.lon.toFixed(2)}`;
    renderForecast(state.weather.forecast);
    saveState();
  } catch {
    state.weather.useMock = true;
    dom.weatherIcon.textContent = mock.icon;
    dom.weatherTemp.textContent = `${mock.temp}°`;
    dom.weatherDesc.textContent = `${mock.desc} (offline fallback)`;
    dom.weatherLocation.textContent = mock.location;
    renderForecast(mock.forecast);
  }
}

function renderForecast(items) {
  dom.forecast.innerHTML = "";
  items.forEach((item) => {
    const div = document.createElement("div");
    div.className = "forecast-day";
    div.innerHTML = `<strong>${item.day}</strong><br>${item.icon}<br>${item.min}°/${item.max}°`;
    dom.forecast.appendChild(div);
  });
}

function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      timeout: 7000,
      enableHighAccuracy: true
    });
  });
}

function weatherCodeToIcon(code) {
  if ([0].includes(code)) return "☀️";
  if ([1, 2].includes(code)) return "🌤";
  if ([3].includes(code)) return "☁️";
  if ([45, 48].includes(code)) return "🌫";
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return "🌧";
  if ([71, 73, 75].includes(code)) return "❄️";
  if ([95, 96, 99].includes(code)) return "⛈";
  return "⛅";
}

function weatherCodeToText(code) {
  if ([0].includes(code)) return "Clear";
  if ([1, 2].includes(code)) return "Partly cloudy";
  if ([3].includes(code)) return "Cloudy";
  if ([45, 48].includes(code)) return "Fog";
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return "Rain";
  if ([71, 73, 75].includes(code)) return "Snow";
  if ([95, 96, 99].includes(code)) return "Thunderstorm";
  return "Weather";
}

function wireCalendar() {
  dom.addEventBtn.addEventListener("click", () => openEventModal());
  dom.cancelEventBtn.addEventListener("click", () => dom.eventModal.close());

  dom.eventForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const payload = {
      id: dom.eventId.value || crypto.randomUUID(),
      title: dom.eventTitle.value.trim(),
      date: dom.eventDate.value,
      time: dom.eventTime.value
    };

    const existingIndex = state.calendarEvents.findIndex((item) => item.id === payload.id);
    if (existingIndex >= 0) {
      state.calendarEvents[existingIndex] = payload;
    } else {
      state.calendarEvents.push(payload);
    }

    state.calendarEvents.sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
    saveState();
    renderCalendar();
    dom.eventModal.close();
  });
}

function openEventModal(eventData = null) {
  dom.eventModalTitle.textContent = eventData ? "Edit Event" : "Add Event";
  dom.eventId.value = eventData?.id || "";
  dom.eventTitle.value = eventData?.title || "";
  dom.eventDate.value = eventData?.date || new Date().toISOString().slice(0, 10);
  dom.eventTime.value = eventData?.time || "09:00";
  dom.eventModal.showModal();
}

function renderCalendar() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = (firstDay.getDay() + 6) % 7;

  dom.calendarTitle.textContent = firstDay.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric"
  });

  dom.calendarGrid.innerHTML = "";
  ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].forEach((d) => {
    const label = document.createElement("div");
    label.className = "dow";
    label.textContent = d;
    dom.calendarGrid.appendChild(label);
  });

  for (let i = 0; i < startOffset; i += 1) {
    const empty = document.createElement("div");
    empty.className = "day";
    dom.calendarGrid.appendChild(empty);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const hasEvent = state.calendarEvents.some((event) => event.date === date);
    const cell = document.createElement("div");
    cell.className = `day ${hasEvent ? "has-event" : ""} ${day === now.getDate() ? "today" : ""}`;
    cell.textContent = String(day);
    dom.calendarGrid.appendChild(cell);
  }

  dom.eventList.innerHTML = "";
  state.calendarEvents.forEach((eventItem) => {
    const row = document.createElement("div");
    row.className = "event-item";
    row.innerHTML = `
      <div>
        <strong>${escapeHtml(eventItem.title)}</strong><br>
        <span>${eventItem.date} ${eventItem.time}</span>
      </div>
      <div class="event-actions">
        <button class="btn small" data-edit-event="${eventItem.id}">Edit</button>
        <button class="btn small secondary" data-delete-event="${eventItem.id}">Del</button>
      </div>
    `;
    dom.eventList.appendChild(row);
  });

  dom.eventList.querySelectorAll("[data-edit-event]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.editEvent;
      const found = state.calendarEvents.find((item) => item.id === id);
      if (found) openEventModal(found);
    });
  });

  dom.eventList.querySelectorAll("[data-delete-event]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.deleteEvent;
      state.calendarEvents = state.calendarEvents.filter((item) => item.id !== id);
      saveState();
      renderCalendar();
    });
  });

  // Integration point: map local event model to Google Calendar API sync in future.
}

function wireClock() {
  dom.showDateToggle.checked = state.clock.showDate;
  dom.showDateToggle.addEventListener("change", () => {
    state.clock.showDate = dom.showDateToggle.checked;
    saveState();
    tickClock();
  });
}

function tickClock() {
  const now = new Date();
  const timeText = now.toLocaleTimeString("de-DE", {
    timeZone: "Europe/Berlin",
    hour12: false
  });

  const dateText = now.toLocaleDateString("de-DE", {
    timeZone: "Europe/Berlin",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  dom.clockTime.textContent = timeText;
  dom.clockDate.textContent = state.clock.showDate ? dateText : "";
}

function wireSlideshow() {
  dom.slideInterval.value = String(state.slideshow.intervalSec);
  dom.slideIntervalLabel.textContent = `${state.slideshow.intervalSec}s`;

  dom.slideInterval.addEventListener("input", () => {
    state.slideshow.intervalSec = Number(dom.slideInterval.value);
    dom.slideIntervalLabel.textContent = `${state.slideshow.intervalSec}s`;
    saveState();
    startSlideshow();
  });

  dom.imageInput.addEventListener("change", async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const converted = await Promise.all(files.map(fileToDataUrl));
    state.slideshow.images.push(...converted);
    state.slideshow.index = 0;
    saveState();
    renderSlideshow();
    startSlideshow();
  });

  renderSlideshow();
  startSlideshow();
  // Integration point: Google Photos can hydrate state.slideshow.images with OAuth token.
}

function renderSlideshow() {
  const images = state.slideshow.images;
  if (!images.length) {
    dom.slideImage.style.display = "none";
    dom.slideEmpty.style.display = "grid";
    return;
  }

  state.slideshow.index %= images.length;
  dom.slideImage.src = images[state.slideshow.index];
  dom.slideImage.style.display = "block";
  dom.slideEmpty.style.display = "none";
}

function startSlideshow() {
  clearInterval(slideTimer);
  if (state.slideshow.images.length < 2) return;
  slideTimer = setInterval(() => {
    state.slideshow.index = (state.slideshow.index + 1) % state.slideshow.images.length;
    renderSlideshow();
    saveState();
  }, state.slideshow.intervalSec * 1000);
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function wireSpotify() {
  dom.spotifyPlay.addEventListener("click", () => {
    state.spotify.isPlaying = !state.spotify.isPlaying;
    renderSpotify();
    saveState();
  });

  dom.spotifyPrev.addEventListener("click", () => {
    state.spotify.currentIndex =
      (state.spotify.currentIndex - 1 + state.spotify.tracks.length) % state.spotify.tracks.length;
    renderSpotify();
    saveState();
  });

  dom.spotifyNext.addEventListener("click", () => {
    state.spotify.currentIndex = (state.spotify.currentIndex + 1) % state.spotify.tracks.length;
    renderSpotify();
    saveState();
  });

  dom.spotifyOpenBtn.addEventListener("click", () => {
    window.open("https://open.spotify.com", "_blank", "noopener");
  });

  dom.spotifyPlaylist.addEventListener("click", () => {
    window.open("https://open.spotify.com/collection/playlists", "_blank", "noopener");
  });

  // Integration point: connect Spotify Web Playback SDK + OAuth and replace mock handlers.
}

function renderSpotify() {
  const track = state.spotify.tracks[state.spotify.currentIndex];
  dom.spotifyTrack.textContent = track.title;
  dom.spotifyArtist.textContent = track.artist;
  dom.spotifyPlay.textContent = state.spotify.isPlaying ? "⏸" : "▶";
}

function hexToRgbCsv(hex) {
  const cleaned = hex.replace("#", "");
  const bigint = parseInt(cleaned, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `${r}, ${g}, ${b}`;
}

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
