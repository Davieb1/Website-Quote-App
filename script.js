<!-- jsPDF CDN -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<script>
    const { jsPDF } = window.jspdf;

    function calculateQuote(pages, features, additional) {
        const hourlyRate = 65;
        let totalTime = 0;
        let breakdown = [];
        let complexity = 'Low';
        const resources = new Set(['HTML', 'CSS', 'JavaScript']);

        pages = Math.max(1, pages || 1);
        const pageTime = pages * 5;
        totalTime += pageTime;
        breakdown.push(`${pages} Page(s): ${pageTime} hours, £${pageTime * hourlyRate}`);

        const featureCosts = {
            'e-commerce': { time: 20, resources: ['Node.js', 'Database'] },
            'custom-design': { time: 15, resources: ['Photoshop', 'CSS'] },
            'cms': { time: 10, resources: ['WordPress'] },
            'seo': { time: 8, resources: ['SEO Tools'] },
            'responsive': { time: 5, resources: [] },
            'api-integration': { time: 15, resources: ['Node.js'] }
        };

        features.forEach(feature => {
            if (featureCosts[feature]) {
                const { time, resources: extraResources } = featureCosts[feature];
                totalTime += time;
                breakdown.push(`${feature}: ${time} hours, £${time * hourlyRate}`);
                extraResources.forEach(res => resources.add(res));
            }
        });

        let additionalTime = 0;
        if (additional.trim()) {
            additionalTime = 10;
            totalTime += additionalTime;
            breakdown.push(`Additional Features (${additional}): ${additionalTime} hours, £${additionalTime * hourlyRate}`);
            resources.add('Custom Development');
        }

        if (totalTime > 50) complexity = 'High';
        else if (totalTime > 20) complexity = 'Medium';

        const totalCost = totalTime * hourlyRate;

        return { totalTime, totalCost, complexity, resources: Array.from(resources), breakdown, pages, features, additional };
    }

    document.getElementById('quoteForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const pages = parseInt(document.getElementById('pages').value);
        const features = Array.from(document.querySelectorAll('input[name="features"]:checked')).map(input => input.value);
        const additional = document.getElementById('additional').value;

        const quote = calculateQuote(pages, features, additional);

        // Display the quote
        document.getElementById('quoteDate').textContent = new Date().toLocaleDateString();
        document.getElementById('quotePages').textContent = quote.pages;
        document.getElementById('quoteFeatures').textContent = quote.features.length > 0 ? quote.features.join(', ') : 'None';
        document.getElementById('quoteAdditional').textContent = quote.additional.trim() || 'None';
        document.getElementById('quoteTime').textContent = quote.totalTime;
        document.getElementById('quoteCost').textContent = quote.totalCost;
        document.getElementById('quoteComplexity').textContent = quote.complexity;
        document.getElementById('quoteResources').textContent = quote.resources.join(', ');

        const breakdownList = document.getElementById('quoteBreakdown');
        breakdownList.innerHTML = '';
        quote.breakdown.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            breakdownList.appendChild(li);
        });

        document.getElementById('quoteResult').classList.add('show');

        // PDF Download with Logo
        document.getElementById('downloadBtn').onclick = () => {
            const doc = new jsPDF();

            // Add logo to PDF
            const img = document.getElementById('quoteLogo');
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            const imgData = canvas.toDataURL('image/jpeg');
            doc.addImage(imgData, 'JPEG', 80, 10, 50, 20); // Adjust position/size as needed

            doc.setFontSize(16);
            doc.text('Website Development Quote', 105, 40, { align: 'center' });
            doc.setFontSize(12);
            doc.text(`Prepared by Dynamic Fit Tech - Date: ${new Date().toLocaleDateString()}`, 105, 50, { align: 'center' });
            doc.text('Based on your input, we estimate the following costs:', 105, 60, { align: 'center' });

            doc.setFontSize(14);
            doc.text('Project Details', 20, 80);
            doc.setFontSize(12);
            doc.text(`Pages: ${quote.pages}`, 20, 90);
            doc.text(`Features: ${quote.features.length > 0 ? quote.features.join(', ') : 'None'}`, 20, 100);
            doc.text(`Additional Features/Notes: ${quote.additional.trim() || 'None'}`, 20, 110, { maxWidth: 170 });

            doc.setFontSize(14);
            doc.text('Quote Summary', 20, 130);
            doc.setFontSize(12);
            doc.text(`Total Time: ${quote.totalTime} hours`, 20, 140);
            doc.text(`Total Cost: £${quote.totalCost}`, 20, 150);
            doc.text(`Complexity: ${quote.complexity}`, 20, 160);
            doc.text(`Resources: ${quote.resources.join(', ')}`, 20, 170, { maxWidth: 170 });

            doc.setFontSize(14);
            doc.text('Breakdown', 20, 190);
            doc.setFontSize(12);
            let y = 200;
            quote.breakdown.forEach(item => {
                doc.text(`- ${item}`, 20, y, { maxWidth: 170 });
                y += 10;
            });

            doc.save('Website_Quote.pdf');
        };
    });