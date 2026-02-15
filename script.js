console.log("Travel Budget Calculator Loaded");

// Dummy currency rates (static for now)
const currencyRates = {
  INR: 1,
  USD: 0.012,
  EUR: 0.011
};

const receiptInput = document.getElementById("receipt");
const ocrText = document.getElementById("ocrText");

receiptInput.addEventListener("change", () => {
  const file = receiptInput.files[0];
  if (!file) return;

  ocrText.textContent = "⏳ Scanning receipt...";

  Tesseract.recognize(file, 'eng', {
    logger: m => console.log(m) // optional: log progress
  }).then(({ data: { text } }) => {
    ocrText.textContent = `📄 Extracted Text:\n${text}`;
  }).catch(err => {
    console.error(err);
    ocrText.textContent = "❌ Failed to read the receipt. Try a clearer image.";
  });
});


document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("budget-form");
  const resultSection = document.getElementById("result");
  const totalCostOutput = document.getElementById("totalCost");
  const costPerPersonOutput = document.getElementById("costPerPerson");
  const loadingText = document.getElementById("loadingText");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    loadingText.style.display = "block";
    resultSection.classList.remove("show");

    setTimeout(() => {
      const currency = document.getElementById("currency").value;
      const people = parseInt(document.getElementById("people").value);
      const days = parseInt(document.getElementById("days").value);
      const transport = parseFloat(document.getElementById("transport").value);
      const accommodation = parseFloat(document.getElementById("accommodation").value);
      const food = parseFloat(document.getElementById("food").value);
      const extras = parseFloat(document.getElementById("extras").value) || 0;

      const totalAccommodation = accommodation * days;
      const totalFood = food * people * days;
      const total = transport + totalAccommodation + totalFood + extras;
      const perPerson = total / people;

      // Convert using selected currency
      const convertedTotal = total * currencyRates[currency];
      const convertedPerPerson = perPerson * currencyRates[currency];
      const symbol = currency === "INR" ? "₹" : currency === "USD" ? "$" : "€";

      // Display
      totalCostOutput.textContent = `Total Cost: ${symbol}${convertedTotal.toFixed(2)}`;
      costPerPersonOutput.textContent = `Per Person: ${symbol}${convertedPerPerson.toFixed(2)}`;

      // Save to localStorage
      localStorage.setItem("lastBudget", JSON.stringify({
        destination: document.getElementById("destination").value,
        currency,
        total: convertedTotal,
        perPerson: convertedPerPerson
      }));

      loadingText.style.display = "none";
      resultSection.classList.add("show");
    }, 1000);
  });
});
const downloadBtn = document.getElementById("downloadPDF");

downloadBtn.addEventListener("click", () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const destination = document.getElementById("destination").value;
  const people = document.getElementById("people").value;
  const days = document.getElementById("days").value;
  const transport = document.getElementById("transport").value;
  const accommodation = document.getElementById("accommodation").value;
  const food = document.getElementById("food").value;
  const extras = document.getElementById("extras").value || 0;

  const totalText = document.getElementById("totalCost").textContent;
  const perPersonText = document.getElementById("costPerPerson").textContent;

  const itinerary = document.getElementById("itinerary").value.trim();


  doc.setFontSize(16);
  doc.text("Travel Budget Summary", 20, 20);

  doc.setFontSize(12);
  doc.text(`Destination: ${destination}`, 20, 35);
  doc.text(`People: ${people}`, 20, 45);
  doc.text(`Days: ${days}`, 20, 55);
  doc.text(`Transport: ${transport}`, 20, 65);
  doc.text(`Accommodation (per night): ${accommodation}`, 20, 75);
  doc.text(`Food (per person per day): ${food}`, 20, 85);
  doc.text(`Extras: ${extras}`, 20, 95);

  doc.text(totalText, 20, 110);
  doc.text(perPersonText, 20, 120);

  if (itinerary) {
  const lines = doc.splitTextToSize(itinerary, 170);
  doc.text("🗓️ Itinerary:", 20, 135);
  doc.text(lines, 20, 145);
}

  doc.save(`Budget-${destination || 'Trip'}.pdf`);
});

const toggleBtn = document.getElementById("themeToggle");

if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
  toggleBtn.textContent = "🌞";
}

toggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  toggleBtn.textContent = isDark ? "🌞" : "🌙";
  localStorage.setItem("theme", isDark ? "dark" : "light");
});


