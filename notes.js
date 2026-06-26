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

    // 2. STUDY PROGRESS TRACKER (BOOKMARKS & LOCALSTORAGE)
    const getProgress = (key) => {
        return JSON.parse(localStorage.getItem(`progress_${key}`) || '{}');
    };

    const setProgress = (key, progress) => {
        localStorage.setItem(`progress_${key}`, JSON.stringify(progress));
    };

    const initProgressTracker = () => {
        if (!container) return;

        // Prepend bookmark checkboxes inside summaries
        const detailsList = document.querySelectorAll('details');
        const progress = getProgress(pageKey);

        detailsList.forEach((detail, index) => {
            const summary = detail.querySelector('summary');
            if (summary) {
                const bookmark = document.createElement('span');
                bookmark.className = 'bookmark-btn';
                bookmark.title = 'Mark as completed';
                bookmark.setAttribute('data-index', index);
                
                if (progress[index]) {
                    bookmark.classList.add('active');
                }

                // Star bookmark click trigger
                bookmark.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    bookmark.classList.toggle('active');
                    const isActive = bookmark.classList.contains('active');
                    
                    const currentProgress = getProgress(pageKey);
                    if (isActive) {
                        currentProgress[index] = true;
                    } else {
                        delete currentProgress[index];
                    }
                    setProgress(pageKey, currentProgress);
                    updateProgressUI();
                });

                summary.insertBefore(bookmark, summary.firstChild);
            }
        });

        // UI update function
        const updateProgressUI = () => {
            const total = detailsList.length;
            if (total === 0) return;
            const currentProgress = getProgress(pageKey);
            const completed = Object.keys(currentProgress).length;
            const percent = Math.round((completed / total) * 100);
            
            const percentText = document.querySelector('.progress-percent');
            const countText = document.querySelector('.progress-count');
            const fill = document.querySelector('.progress-bar-fill');
            
            if (percentText) percentText.textContent = `${percent}%`;
            if (countText) countText.textContent = `${completed}/${total}`;
            if (fill) fill.style.width = `${percent}%`;
        };

        updateProgressUI();
    };

    // 4. FLOATING OUTLINE NAV DRAWER (Quick Jump with Scroll Offset Fix)
    const initOutlineDrawer = () => {
        if (!container) return;

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
        drawerHeader.textContent = 'Chapter Outline';
        
        const list = document.createElement('ul');
        list.className = 'drawer-list';
        
        drawer.appendChild(drawerHeader);
        drawer.appendChild(list);
        document.body.appendChild(drawer);

        // Populate drawer
        const detailsList = document.querySelectorAll('details');
        detailsList.forEach((detail, index) => {
            const summary = detail.querySelector('summary');
            if (summary) {
                // Strip the bookmark stars and extra spacing
                const summaryText = summary.textContent.replace('☆', '').replace('★', '').trim();
                const li = document.createElement('li');
                li.className = 'drawer-item';
                li.textContent = summaryText;
                li.title = summaryText;

                li.addEventListener('click', () => {
                    drawer.classList.remove('open');
                    
                    // Fixed Scroll Offset Calculation (Accounts for sticky nav height + spacing)
                    const navHeight = document.querySelector('.top-nav')?.offsetHeight || 60;
                    const targetTop = detail.getBoundingClientRect().top + window.scrollY - navHeight - 20;

                    window.scrollTo({
                        top: targetTop,
                        behavior: 'smooth'
                    });

                    // Open details block
                    detail.open = true;

                    // Flash highlight outline
                    detail.style.outline = '2px solid var(--primary-color)';
                    setTimeout(() => {
                        detail.style.outline = 'none';
                    }, 1200);
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

    // 5. INJECT BOOK LAYOUT MARGIN & GUTTER LINE
    const initPageGutter = () => {
        if (container && !document.querySelector('.container-gutter')) {
            const gutter = document.createElement('div');
            gutter.className = 'container-gutter';
            container.appendChild(gutter);
        }
    };

    // 6. TEXTBOOK RUNNING HEADER AND FOOTER INJECTION
    const initTextbookHeaderFooter = () => {
        if (!container) return;

        // Create & Prepend Textbook Header Line
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

        // Create & Append Textbook Footer Line with Page Numbering
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

    // 7. PAGE TURN TRANSITION INTERCEPTOR
    const initPageTurnNavigation = () => {
        // Intercept navigation links (prev, next, home links)
        const navLinks = document.querySelectorAll('.top-nav a, .read-action, .drawer-item');
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && href.endsWith('.html')) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    
                    if (container) {
                        // Apply 3D exit swing animation
                        container.classList.add('turn-exit');
                        
                        // Wait for transition animation to finish before navigating
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
    initProgressTracker();
    initOutlineDrawer();
    initPageTurnNavigation();
});
