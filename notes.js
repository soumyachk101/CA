/* ==================================================
   notes.js — Dynamic Interactivity for Q&A Foliopages
   ================================================== */

document.addEventListener('DOMContentLoaded', () => {
    const pageKey = window.location.pathname.split('/').pop() || 'index.html';
    const container = document.querySelector('.container');

    // Helper: Determine page range based on current module
    const getPageMetadata = (key) => {
        if (key.includes('pipelining')) {
            return { title: 'Chapter I: Performance & Pipelining', startPage: 1 };
        } else if (key.includes('memory')) {
            return { title: 'Chapter II: Memory Hierarchy', startPage: 41 };
        } else if (key.includes('ilp')) {
            return { title: 'Chapter III: Instruction-Level Parallelism', startPage: 81 };
        } else if (key.includes('vector')) {
            return { title: 'Chapter IV: Array & Vector Pipeline', startPage: 121 };
        } else if (key.includes('multiprocessor')) {
            return { title: 'Chapter V: Multiprocessor Architecture', startPage: 161 };
        }
        return { title: 'Computer Architecture Notes', startPage: 1 };
    };

    const pageMeta = getPageMetadata(pageKey);

    // 1. FLASHCARD MODE
    const initFlashcardMode = () => {
        const cards = document.querySelectorAll('.qa-card');
        if (cards.length === 0) return;

        let currentIndex = 0;

        // Create pagination controls
        const controls = document.createElement('div');
        controls.className = 'flashcard-controls';
        
        const prevBtn = document.createElement('button');
        prevBtn.id = 'flash-prev';
        prevBtn.className = 'flash-btn';
        prevBtn.textContent = '← Previous';
        
        const countDisplay = document.createElement('div');
        countDisplay.className = 'flash-count';
        countDisplay.innerHTML = `Question <span id="flash-current">1</span> of <span>${cards.length}</span>`;
        
        const nextBtn = document.createElement('button');
        nextBtn.id = 'flash-next';
        nextBtn.className = 'flash-btn';
        nextBtn.textContent = 'Next →';
        
        controls.appendChild(prevBtn);
        controls.appendChild(countDisplay);
        controls.appendChild(nextBtn);
        
        // Append controls after the section containing cards
        const section = document.querySelector('.section');
        if (section) {
            section.appendChild(controls);
        }

        const updateView = () => {
            cards.forEach((card, idx) => {
                card.style.display = (idx === currentIndex) ? 'block' : 'none';
            });
            
            document.getElementById('flash-current').textContent = currentIndex + 1;
            prevBtn.disabled = (currentIndex === 0);
            nextBtn.disabled = (currentIndex === cards.length - 1);
            
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };

        prevBtn.addEventListener('click', () => {
            if (currentIndex > 0) {
                currentIndex--;
                updateView();
            }
        });

        nextBtn.addEventListener('click', () => {
            if (currentIndex < cards.length - 1) {
                currentIndex++;
                updateView();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                if (currentIndex > 0) {
                    currentIndex--;
                    updateView();
                }
            } else if (e.key === 'ArrowRight') {
                if (currentIndex < cards.length - 1) {
                    currentIndex++;
                    updateView();
                }
            }
        });

        // Expose function globally for the Outline Drawer
        window.jumpToFlashcard = (index) => {
            if (index >= 0 && index < cards.length) {
                currentIndex = index;
                updateView();
            }
        };

        // Initial setup
        updateView();
    };

    // 2. FLOATING OUTLINE NAV DRAWER
    const initOutlineDrawer = () => {
        if (!container) return;
        const cards = document.querySelectorAll('.qa-card');
        if (cards.length === 0) return;

        // Toggle button
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'drawer-toggle';
        toggleBtn.title = 'Outline Table of Contents';
        toggleBtn.innerHTML = '☰';
        document.body.appendChild(toggleBtn);
        
        // Drawer Box
        const drawer = document.createElement('div');
        drawer.className = 'jump-drawer';
        
        const drawerHeader = document.createElement('div');
        drawerHeader.className = 'drawer-header';
        drawerHeader.textContent = 'Question Outline';
        
        const list = document.createElement('ul');
        list.className = 'drawer-list';
        
        drawer.appendChild(drawerHeader);
        drawer.appendChild(list);
        document.body.appendChild(drawer);

        // Populate drawer
        cards.forEach((card, index) => {
            const questionEl = card.querySelector('.qa-question');
            if (questionEl) {
                const summaryText = questionEl.textContent.trim();
                const li = document.createElement('li');
                li.className = 'drawer-item';
                li.textContent = summaryText;
                li.title = summaryText;

                li.addEventListener('click', () => {
                    drawer.classList.remove('open');
                    if (window.jumpToFlashcard) {
                        window.jumpToFlashcard(index);
                    }
                });
                list.appendChild(li);
            }
        });

        // Toggle Open/Close
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            drawer.classList.toggle('open');
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (drawer.classList.contains('open') && !drawer.contains(e.target) && e.target !== toggleBtn) {
                drawer.classList.remove('open');
            }
        });
    };

    // 3. INJECT BOOK LAYOUT MARGIN & GUTTER LINE
    const initPageGutter = () => {
        if (container && !document.querySelector('.container-gutter')) {
            const gutter = document.createElement('div');
            gutter.className = 'container-gutter';
            container.appendChild(gutter);
        }
    };

    // 4. TEXTBOOK RUNNING HEADER AND FOOTER INJECTION
    const initTextbookHeaderFooter = () => {
        if (!container) return;

        if (!document.querySelector('.textbook-header-line')) {
            const headLine = document.createElement('div');
            headLine.className = 'textbook-header-line';
            
            const subjectSpan = document.createElement('span');
            subjectSpan.textContent = 'Computer Architecture';
            
            const chapterSpan = document.createElement('span');
            const navTitle = document.querySelector('.nav-title')?.textContent || 'Module I';
            const chapterLabel = navTitle.split(' of ')[0] || 'Chapter I';
            chapterSpan.textContent = chapterLabel;
            
            headLine.appendChild(subjectSpan);
            headLine.appendChild(chapterSpan);
            container.insertBefore(headLine, container.firstChild);
        }

        if (!document.querySelector('.textbook-footer-line')) {
            const footLine = document.createElement('div');
            footLine.className = 'textbook-footer-line';
            
            const imprintSpan = document.createElement('span');
            imprintSpan.textContent = 'Computer Science Compendium';
            
            const pageSpan = document.createElement('span');
            pageSpan.className = 'textbook-page-num';
            pageSpan.textContent = `p. ${pageMeta.startPage}`;
            
            footLine.appendChild(imprintSpan);
            footLine.appendChild(pageSpan);
            container.appendChild(footLine);
        }
    };

    // 5. PAGE TURN TRANSITION INTERCEPTOR
    const initPageTurnNavigation = () => {
        const navLinks = document.querySelectorAll('.top-nav a, .read-action');
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && href.endsWith('.html')) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (container) {
                        container.classList.add('turn-exit');
                        setTimeout(() => {
                            window.location.href = href;
                        }, 500);
                    } else {
                        window.location.href = href;
                    }
                });
            }
        });
    };

    // Execute all functions
    initPageGutter();
    initTextbookHeaderFooter();
    initFlashcardMode();
    initOutlineDrawer();
    initPageTurnNavigation();
});
