document.addEventListener('DOMContentLoaded', () => {

    // Google Sheets Integration Configuration
    // REPLACE THIS URL WITH YOUR ACTUAL DEPLOYED GOOGLE APPS SCRIPT WEB APP URL
    const googleSheetsUrl = ''; 

    // UTM Tracking Initialization
    function initUtmTracking() {
        const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid'];
        const urlParams = new URLSearchParams(window.location.search);
        
        utmKeys.forEach(key => {
            const val = urlParams.get(key);
            if (val) {
                sessionStorage.setItem(key, val);
            }
        });
    }
    initUtmTracking();

    function getSavedUtmParams() {
        const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid'];
        const params = {};
        utmKeys.forEach(key => {
            params[key] = sessionStorage.getItem(key) || '';
        });
        return params;
    }

    // Send Lead to Google Sheets
    function sendLeadToGoogleSheets(leadData) {
        if (!googleSheetsUrl) {
            console.warn('Google Sheets Web App URL is not configured. Lead not saved to sheet.');
            return Promise.resolve(false);
        }
        
        const utmParams = getSavedUtmParams();
        const payload = {
            ...leadData,
            ...utmParams,
            url: window.location.href,
            timestamp: new Date().toLocaleString('es-MX')
        };
        
        return fetch(googleSheetsUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload),
            keepalive: true
        }).catch(err => {
            console.error('Error sending lead to Google Sheets:', err);
        });
    }

    // 1. Header Scroll Class & Back to Top Button
    const header = document.getElementById('header');
    const scrollTopBtn = document.getElementById('scrollTop');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        if (window.scrollY > 500) {
            scrollTopBtn.classList.add('show');
        } else {
            scrollTopBtn.classList.remove('show');
        }
    });

    // 2. Mobile Menu Toggle
    const mobileToggle = document.getElementById('mobileToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = navMenu.querySelectorAll('a');

    mobileToggle.addEventListener('click', () => {
        navMenu.classList.toggle('show');
        const icon = mobileToggle.querySelector('i');
        if (navMenu.classList.contains('show')) {
            icon.className = 'fa-solid fa-xmark';
        } else {
            icon.className = 'fa-solid fa-bars';
        }
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('show');
            mobileToggle.querySelector('i').className = 'fa-solid fa-bars';
        });
    });

    // 3. Smooth Scroll Active Link Highlight
    const sections = document.querySelectorAll('section');
    
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= (sectionTop - 220)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current) && current !== '') {
                link.classList.add('active');
            }
        });
    });

    // 4. CFE Modal Helper Show/Hide
    const cfeHelpTrigger = document.getElementById('cfeHelpTrigger');
    const cfeModal = document.getElementById('cfeModal');
    const cfeModalClose = document.getElementById('cfeModalClose');

    if (cfeHelpTrigger && cfeModal && cfeModalClose) {
        cfeHelpTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            cfeModal.classList.add('active');
        });

        cfeModalClose.addEventListener('click', () => {
            cfeModal.classList.remove('active');
        });

        // Close on clicking outside the card
        cfeModal.addEventListener('click', (e) => {
            if (e.target === cfeModal) {
                cfeModal.classList.remove('active');
            }
        });
    }

    // 5. FAQ Accordion Click Handler
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');

        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all items
            faqItems.forEach(fit => {
                fit.classList.remove('active');
                fit.querySelector('.faq-answer').style.maxHeight = null;
            });

            // Toggle current item
            if (!isActive) {
                item.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + "px";
            }
        });
    });

    // 6. Packages Tab Grid Filter (Home vs Business)
    const btnFilterRes = document.getElementById('btnFilterRes');
    const btnFilterCom = document.getElementById('btnFilterCom');
    const resCards = document.querySelectorAll('.filter-res');
    const comCards = document.querySelectorAll('.filter-com');

    // Default: Show residential, hide commercial
    function showResidential() {
        btnFilterRes.classList.add('active');
        btnFilterCom.classList.remove('active');
        resCards.forEach(c => c.classList.remove('hidden'));
        comCards.forEach(c => c.classList.add('hidden'));
    }

    function showCommercial() {
        btnFilterCom.classList.add('active');
        btnFilterRes.classList.remove('active');
        comCards.forEach(c => c.classList.remove('hidden'));
        resCards.forEach(c => c.classList.add('hidden'));
    }

    if (btnFilterRes && btnFilterCom) {
        btnFilterRes.addEventListener('click', showResidential);
        btnFilterCom.addEventListener('click', showCommercial);
        // Run default filter
        showResidential();
    }

    // 7. Interactive CFE bill savings calculator logic
    const billSlider = document.getElementById('billSlider');
    const billValText = document.getElementById('billValText');
    const regionSelect = document.getElementById('regionSelect');
    const tariffSelect = document.getElementById('tariffSelect');
    const billOptBtns = document.querySelectorAll('.bill-opt-btn');

    const savingsAnualText = document.getElementById('savingsAnualText');
    const systemSizeText = document.getElementById('systemSizeText');
    const panelCountText = document.getElementById('panelCountText');
    const roiText = document.getElementById('roiText');
    const co2Text = document.getElementById('co2Text');
    const calcWhatsAppBtn = document.getElementById('calcWhatsAppBtn');

    // Sync option buttons with slider
    billOptBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            billOptBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const value = btn.getAttribute('data-value');
            billSlider.value = value;
            billValText.textContent = parseInt(value).toLocaleString('es-MX');
            calculateSolarSavings();
        });
    });

    // Sync slider with text and buttons
    billSlider.addEventListener('input', () => {
        const val = parseInt(billSlider.value);
        billValText.textContent = val.toLocaleString('es-MX');
        
        billOptBtns.forEach(btn => {
            const optVal = parseInt(btn.getAttribute('data-value'));
            if (val <= 2000 && optVal === 1500) btn.classList.add('active');
            else if (val > 2000 && val <= 5000 && optVal === 4500) btn.classList.add('active');
            else if (val > 5000 && val <= 12000 && optVal === 9000) btn.classList.add('active');
            else if (val > 12000 && optVal === 25000) btn.classList.add('active');
            else btn.classList.remove('active');
        });
        
        calculateSolarSavings();
    });

    regionSelect.addEventListener('change', calculateSolarSavings);
    
    // Changing tariff also automatically filters package cards for UX!
    tariffSelect.addEventListener('change', () => {
        if (tariffSelect.value === 'residential') {
            showResidential();
        } else {
            showCommercial();
        }
        calculateSolarSavings();
    });

    function calculateSolarSavings() {
        const bill = parseFloat(billSlider.value);
        const region = regionSelect.value;
        const tariff = tariffSelect.value;

        // Average CFE rates in Mexico (DAC = $5.60 MXN, Commercial GDBT = $5.20 MXN)
        const ratePerKwh = (tariff === 'residential') ? 5.60 : 5.20;
        
        const kwhBimestral = bill / ratePerKwh;
        const kwhAnual = kwhBimestral * 6;

        // Peak Sun Hours (HSP) based on region radiation
        let hsp = 5.2; // default center
        let regionName = "Centro";
        if (region === 'north') {
            hsp = 5.8;
            regionName = "Norte";
        } else if (region === 'south') {
            hsp = 4.6;
            regionName = "Sur/Sureste";
        }

        // System efficiency: 82%
        const systemEfficiency = 0.82;
        const generationPerKwpAnual = hsp * 365 * systemEfficiency;

        // Design to cover 95% of CFE bills
        const kwpNeeded = (kwhAnual * 0.95) / generationPerKwpAnual;

        // Panel choice: residential (475W) vs commercial (670W)
        const panelWattage = (tariff === 'residential') ? 475 : 670;
        const panelKwp = panelWattage / 1000;

        const panelCount = Math.ceil(kwpNeeded / panelKwp);
        const realKwp = panelCount * panelKwp;

        const realAnualGeneration = realKwp * generationPerKwpAnual;

        // Anual savings (capped at 97% of CFE bills)
        let anualSavings = realAnualGeneration * ratePerKwh;
        const maxAnualSavings = (bill * 6) * 0.97;
        if (anualSavings > maxAnualSavings) {
            anualSavings = maxAnualSavings;
        }

        // Cost estimation: Residential = $20,500 MXN / kWp. Commercial = $16,000 MXN / kWp
        const costPerKwp = (tariff === 'residential') ? 20500 : 16000;
        const totalSystemCost = realKwp * costPerKwp;

        // ROI
        let roi = totalSystemCost / anualSavings;
        if (roi < 2.2) roi = 2.2;

        // CO2: Factor = 0.44 kg CO2 per kWh in Mexico
        const co2Avoided = (realAnualGeneration * 0.44) / 1000;

        // Update DOM elements
        savingsAnualText.textContent = '$' + Math.round(anualSavings).toLocaleString('es-MX') + ' MXN';
        systemSizeText.textContent = realKwp.toFixed(2) + ' kWp';
        panelCountText.textContent = panelCount + ' paneles (' + panelWattage + 'W)';
        roiText.textContent = roi.toFixed(1) + ' años';
        co2Text.textContent = co2Avoided.toFixed(1) + ' tons';

        // Prefilled WhatsApp message link
        const waMsg = `Hola! Vengo de tongwei.mx. Hice el calculo en la calculadora solar. ` +
                      `Mi recibo de luz CFE es de $${bill.toLocaleString('es-MX')} MXN bimestral, ` +
                      `Ubicacion: ${regionName}, Tarifa: ${tariff === 'residential' ? 'Residencial (DAC)' : 'Comercial/Negocio'}. ` +
                      `Calculo: Sistema de ${realKwp.toFixed(2)} kWp (${panelCount} paneles de ${panelWattage}W). ` +
                      `Deseo agendar mi visita de ingeniero gratis y aplicar el descuento de instalacion.`;
        
        calcWhatsAppBtn.href = `https://wa.me/525512345678?text=${encodeURIComponent(waMsg)}`;
    }

    // Run first calculation
    calculateSolarSavings();

    // 8. Lead Form Submission handler
    const leadForm = document.getElementById('leadForm');
    const formSuccess = document.getElementById('formSuccess');

    if (leadForm) {
        leadForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('name').value;
            const phone = document.getElementById('phone').value;
            const email = document.getElementById('email').value;
            const cfeBill = document.getElementById('cfeBill').value;
            const cfeNumber = document.getElementById('cfeNumber').value;
            const projectType = document.getElementById('projectType').value;
            const message = document.getElementById('message').value;

            // Send lead data to Google Sheets in background
            sendLeadToGoogleSheets({
                type: 'Formulario de Contacto (Cotizar)',
                name: name,
                phone: phone,
                email: email,
                details: `Recibo CFE: $${cfeBill} MXN, Num Servicio CFE: ${cfeNumber}, Tipo Proyecto: ${projectType}, Comentarios: ${message}`
            });

            // Formulate WhatsApp prefilled message
            const waLeadMsg = `Hola, mi nombre es ${name}. He enviado mis datos desde tongwei.mx para cotizar mi proyecto solar. ` +
                              `Detalles de mi solicitud:\n` +
                              `- Teléfono: ${phone}\n` +
                              `- Email: ${email}\n` +
                              `- Recibo CFE bimestral: $${parseFloat(cfeBill).toLocaleString('es-MX')} MXN\n` +
                              `- Número de Servicio CFE: ${cfeNumber}\n` +
                              `- Tipo de Proyecto: ${projectType}\n` +
                              `- Comentarios: ${message}\n\n` +
                              `Adjunto foto de mi recibo de luz para iniciar el calculo tecnico gratis.`;

            const waLink = `https://wa.me/525512345678?text=${encodeURIComponent(waLeadMsg)}`;
            
            // Open WhatsApp link in new tab
            window.open(waLink, '_blank');

            // Show success popup locally
            formSuccess.classList.add('active');
        });
    }

    // Reset success popup
    const successReset = document.getElementById('successReset');
    if (successReset) {
        successReset.addEventListener('click', () => {
            formSuccess.classList.remove('active');
            if (leadForm) {
                leadForm.reset();
            }
        });
    }

    // 9. Scroll Reveal animation observer
    const revealElements = document.querySelectorAll('.reveal');
    
    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // Stop observing once animated
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px' // animate slightly before entering viewport
        });

        revealElements.forEach(el => {
            revealObserver.observe(el);
        });
    } else {
        // Fallback for older browsers
        revealElements.forEach(el => el.classList.add('visible'));
    }

    // 10. Marketing Slider Section Logic
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.getElementById('prevSlide');
    const nextBtn = document.getElementById('nextSlide');
    const sliderWrapper = document.querySelector('.slider-wrapper');
    let currentSlide = 0;
    let autoplayInterval;

    function showSlide(index) {
        if (slides.length === 0) return;
        slides.forEach(s => s.classList.remove('active'));
        dots.forEach(d => d.classList.remove('active'));
        
        currentSlide = (index + slides.length) % slides.length;
        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
    }

    function nextSlide() {
        showSlide(currentSlide + 1);
    }

    function prevSlide() {
        showSlide(currentSlide - 1);
    }

    function startAutoplay() {
        stopAutoplay();
        autoplayInterval = setInterval(nextSlide, 6000); // Auto-advance every 6 seconds
    }

    function stopAutoplay() {
        if (autoplayInterval) {
            clearInterval(autoplayInterval);
        }
    }

    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
            prevSlide();
            startAutoplay();
        });
        
        nextBtn.addEventListener('click', () => {
            nextSlide();
            startAutoplay();
        });
    }

    dots.forEach(dot => {
        dot.addEventListener('click', (e) => {
            const slideIndex = parseInt(e.target.getAttribute('data-slide'));
            showSlide(slideIndex);
            startAutoplay();
        });
    });

    // Touch Swipe Support for Mobile
    let startX = 0;
    let endX = 0;

    if (sliderWrapper) {
        sliderWrapper.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            stopAutoplay();
        }, { passive: true });

        sliderWrapper.addEventListener('touchmove', (e) => {
            endX = e.touches[0].clientX;
        }, { passive: true });

        sliderWrapper.addEventListener('touchend', () => {
            const diffX = startX - endX;
            if (Math.abs(diffX) > 50) { // minimum threshold of 50px
                if (diffX > 0) {
                    nextSlide(); // swipe left -> next
                } else {
                    prevSlide(); // swipe right -> prev
                }
            }
            startAutoplay();
        });
    }

    if (slides.length > 0) {
        startAutoplay();
    }

    // 11. Request Call (Solicitar Llamada) Modal & Forms handler
    const callModal = document.getElementById('callModal');
    const callForm = document.getElementById('callForm');
    const callSuccessMsg = document.getElementById('callSuccessMsg');
    const callModalClose = document.getElementById('callModalClose');
    const callModalTriggers = document.querySelectorAll('.call-modal-trigger');

    if (callModal && callModalTriggers.length > 0) {
        callModalTriggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                if (callForm) callForm.style.display = 'flex';
                if (callSuccessMsg) callSuccessMsg.style.display = 'none';
                if (callForm) callForm.reset();
                callModal.classList.add('active');
            });
        });

        if (callModalClose) {
            callModalClose.addEventListener('click', () => {
                callModal.classList.remove('active');
            });
        }

        callModal.addEventListener('click', (e) => {
            if (e.target === callModal) {
                callModal.classList.remove('active');
            }
        });
    }

    if (callForm) {
        callForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const callName = document.getElementById('callName').value;
            const callPhone = document.getElementById('callPhone').value;

            // Disable submit button during fetch
            const submitBtn = document.getElementById('callSubmitBtn');
            if (submitBtn) submitBtn.disabled = true;

            sendLeadToGoogleSheets({
                type: 'Solicitud de Llamada',
                name: callName || 'No especificado',
                phone: callPhone,
                email: '',
                details: 'El usuario solicitó una llamada telefónica gratuita de un asesor.'
            }).finally(() => {
                if (submitBtn) submitBtn.disabled = false;
                if (callForm) callForm.style.display = 'none';
                if (callSuccessMsg) callSuccessMsg.style.display = 'block';
                
                // Automatically close modal after 3 seconds
                setTimeout(() => {
                    callModal.classList.remove('active');
                }, 3000);
            });
        });
    }

    // 12. Track all clicks on WhatsApp links
    function bindWhatsAppClickTracking() {
        document.querySelectorAll('a').forEach(link => {
            const href = link.getAttribute('href') || '';
            if (href.includes('wa.me')) {
                link.addEventListener('click', () => {
                    const btnText = link.innerText.trim() || link.getAttribute('title') || 'Botón WhatsApp';
                    sendLeadToGoogleSheets({
                        type: 'Clic en WhatsApp',
                        name: 'Visitante Anónimo',
                        phone: '',
                        email: '',
                        details: `Botón: "${btnText}", URL de destino: ${href}`
                    });
                });
            }
        });
    }
    
    // Bind after DOM is stable
    setTimeout(bindWhatsAppClickTracking, 1000);

});
