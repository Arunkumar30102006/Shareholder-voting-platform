import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
const PillNav = ({ logo, logoAlt = 'Logo', items, activeHref, className = '', navClassName = '', baseColor = 'transparent', // Default to transparent so parent controls bg
pillColor = '#f97316', // Default Orange-500
hoveredPillTextColor = '#fff', pillTextColor = '#000', textColor = '#fff', onMobileMenuClick, initialLoadAnimation = true }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const circleRefs = useRef([]);
    const tlRefs = useRef([]);
    const activeTweenRefs = useRef([]);
    const logoImgRef = useRef(null);
    const logoTweenRef = useRef(null);
    const hamburgerRef = useRef(null);
    const mobileMenuRef = useRef(null);
    const navItemsRef = useRef(null);
    const logoRef = useRef(null);
    const hasAnimatedRef = useRef(false);
    // GSAP Layout Effect
    useEffect(() => {
        const layout = () => {
            // PHASE 1: Batch all DOM reads (getBoundingClientRect) first to avoid layout thrashing
            const measurements = [];
            circleRefs.current.forEach((circle, i) => {
                if (!circle?.parentElement) {
                    measurements.push(null);
                    return;
                }
                const pill = circle.parentElement;
                const rect = pill.getBoundingClientRect();
                const { width: w, height: h } = rect;
                if (w === 0 || h === 0) {
                    measurements.push(null);
                    return;
                }
                const label = pill.querySelector('.pill-label');
                const white = pill.querySelector('.pill-label-hover');
                const index = circleRefs.current.indexOf(circle);
                measurements.push({ circle, pill, w, h, index, label, white });
            });
            // PHASE 2: Batch all DOM writes in rAF to avoid forced reflow
            requestAnimationFrame(() => {
                measurements.forEach(m => {
                    if (!m)
                        return;
                    const { circle, w, h, index, label, white } = m;
                    // Geometry for the hover circle expansion
                    const R = ((w * w) / 4 + h * h) / (2 * h);
                    const D = Math.ceil(2 * R) + 2;
                    const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
                    const originY = D - delta;
                    circle.style.width = `${D}px`;
                    circle.style.height = `${D}px`;
                    circle.style.bottom = `-${delta}px`;
                    gsap.set(circle, {
                        xPercent: -50,
                        scale: 0,
                        transformOrigin: `50% ${originY}px`
                    });
                    if (label)
                        gsap.set(label, { y: 0 });
                    if (white)
                        gsap.set(white, { y: h + 12, opacity: 0 });
                    if (index === -1)
                        return;
                    tlRefs.current[index]?.kill();
                    const tl = gsap.timeline({ paused: true });
                    // Hover Animation
                    tl.to(circle, { scale: 1.2, xPercent: -50, duration: 0.4, ease: "power2.out", overwrite: 'auto' }, 0);
                    if (label) {
                        tl.to(label, { y: -(h + 8), duration: 0.4, ease: "power2.out", overwrite: 'auto' }, 0);
                    }
                    if (white) {
                        gsap.set(white, { y: Math.ceil(h + 10), opacity: 0 });
                        tl.to(white, { y: 0, opacity: 1, duration: 0.4, ease: "power2.out", overwrite: 'auto' }, 0);
                    }
                    tlRefs.current[index] = tl;
                });
            });
        };
        // Delay slightly to ensure fonts loaded/rendering done
        const timer = setTimeout(layout, 100);
        const onResize = () => layout();
        window.addEventListener('resize', onResize);
        if (document.fonts) {
            document.fonts.ready.then(layout).catch(() => { });
        }
        const menu = mobileMenuRef.current;
        if (menu) {
            gsap.set(menu, { visibility: 'hidden', opacity: 0, scaleY: 1, y: 0 });
        }
        if (initialLoadAnimation && !hasAnimatedRef.current) {
            const logo = logoRef.current;
            const navItems = navItemsRef.current;
            if (logo) {
                gsap.set(logo, { scale: 0, opacity: 0 });
                gsap.to(logo, { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.7)" });
            }
            if (navItems) {
                gsap.fromTo(navItems, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.2, ease: "power2.out" });
            }
            hasAnimatedRef.current = true;
        }
        return () => {
            window.removeEventListener('resize', onResize);
            clearTimeout(timer);
        };
    }, [items, initialLoadAnimation]);
    const handleEnter = (i) => {
        const tl = tlRefs.current[i];
        if (!tl)
            return;
        activeTweenRefs.current[i]?.kill();
        activeTweenRefs.current[i] = tl.tweenTo(tl.duration(), {
            duration: 0.3,
            ease: "power2.out",
            overwrite: 'auto'
        });
    };
    const handleLeave = (i) => {
        const tl = tlRefs.current[i];
        if (!tl)
            return;
        activeTweenRefs.current[i]?.kill();
        activeTweenRefs.current[i] = tl.reverse(); // Simplified reverse
    };
    const handleLogoEnter = () => {
        const img = logoImgRef.current;
        if (!img)
            return;
        logoTweenRef.current?.kill();
        gsap.set(img, { rotate: 0 });
        logoTweenRef.current = gsap.to(img, {
            rotate: 360,
            duration: 0.5,
            ease: "back.out(1.7)",
            overwrite: 'auto'
        });
    };
    const toggleMobileMenu = () => {
        const newState = !isMobileMenuOpen;
        setIsMobileMenuOpen(newState);
        const hamburger = hamburgerRef.current;
        const menu = mobileMenuRef.current;
        if (hamburger) {
            const lines = hamburger.querySelectorAll('.hamburger-line');
            if (newState) {
                gsap.to(lines[0], { rotation: 45, y: 5, duration: 0.3 });
                gsap.to(lines[1], { rotation: -45, y: -5, duration: 0.3 });
            }
            else {
                gsap.to(lines[0], { rotation: 0, y: 0, duration: 0.3 });
                gsap.to(lines[1], { rotation: 0, y: 0, duration: 0.3 });
            }
        }
        if (menu) {
            if (newState) {
                gsap.set(menu, { visibility: 'visible' });
                gsap.fromTo(menu, { opacity: 0, y: 10, scaleY: 0.95 }, {
                    opacity: 1,
                    y: 0,
                    scaleY: 1,
                    duration: 0.3,
                    ease: "power2.out",
                    transformOrigin: 'top center'
                });
            }
            else {
                gsap.to(menu, {
                    opacity: 0,
                    y: 10,
                    scaleY: 0.95,
                    duration: 0.2,
                    ease: "power2.in",
                    transformOrigin: 'top center',
                    onComplete: () => {
                        gsap.set(menu, { visibility: 'hidden' });
                    }
                });
            }
        }
        onMobileMenuClick?.();
    };
    const isExternalLink = (href) => href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#');
    const isRouterLink = (href) => href && !isExternalLink(href);
    const cssVars = {
        ['--base']: baseColor,
        ['--pill-bg']: pillColor,
        ['--hover-text']: hoveredPillTextColor,
        ['--pill-text']: pillTextColor,
        ['--text-color']: textColor,
        ['--nav-h']: '42px',
        ['--pill-pad-x']: '20px',
        ['--pill-gap']: '4px'
    };
    // Render Logic
    return (<div className={`relative ${className}`} style={cssVars}>
            <nav className={`flex items-center justify-between ${navClassName}`} aria-label="Primary">
                {/* Logo Section */}
                {logo && (<div className="flex items-center justify-center mr-4" ref={el => { logoRef.current = el; }} onMouseEnter={handleLogoEnter}>
                        {typeof logo === 'string' ? (isRouterLink(items?.[0]?.href) ? (<Link to={items[0].href} aria-label="Home" className="block">
                                    <img src={logo} alt={logoAlt} ref={logoImgRef} className="h-8 w-auto object-contain block"/>
                                </Link>) : (<a href={items?.[0]?.href || '#'} aria-label="Home" className="block">
                                    <img src={logo} alt={logoAlt} ref={logoImgRef} className="h-8 w-auto object-contain block"/>
                                </a>)) : (logo)}
                    </div>)}

                {/* Desktop Links */}
                <div ref={navItemsRef} className="relative items-center rounded-full hidden md:flex" style={{
            height: 'var(--nav-h)',
            // The container background could be transparent or defined
            background: 'var(--base)'
        }}>
                    <ul className="list-none flex items-center m-0 p-1 h-full rounded-full" style={{ gap: 'var(--pill-gap)' }}>
                        {items.map((item, i) => {
            const normalize = (p) => (p || '').replace(/\/$/, '') || '/';
            const isActive = normalize(activeHref) === normalize(item.href);
            // Styles
            // Active: Background = pillColor, Text = pillTextColor
            // Inactive: Background = transparent, Text = textColor
            const activeStyle = {
                background: 'var(--pill-bg)',
                color: 'var(--pill-text)',
                boxShadow: '0 2px 10px rgba(249, 115, 22, 0.3)' // Subtle glow for active orange pill
            };
            const inactiveStyle = {
                background: 'transparent',
                color: 'var(--text-color)'
            };
            const currentStyle = isActive ? activeStyle : inactiveStyle;
            const PillContent = (<>
                                    {/* Hover Circle - Only for inactive items to show hover effect?
  Or should active items also have it?
  The user wants "Home" to be a solid pill.
  Hovering other items usually creates a pill background effect.
*/}
                                    {!isActive && (<span className="hover-circle absolute left-1/2 bottom-0 rounded-full z-[1] block pointer-events-none" style={{
                        background: 'var(--pill-bg)', // Hover uses pill color
                        opacity: 0.15, // Low opacity for hover effect
                        willChange: 'transform'
                    }} aria-hidden="true" ref={el => {
                        circleRefs.current[i] = el;
                    }}/>)}

                                    <span className="relative z-[2] font-medium text-sm flex items-center gap-2 px-1">
                                        {/* Non-hovered Text */}
                                        <span className="pill-label relative inline-flex items-center gap-2" style={{ willChange: 'transform' }}>
                                            {item.icon && <span className="text-current w-4 h-4">{item.icon}</span>}
                                            {item.label}
                                        </span>

                                        {/* Hovered Text - Only needed if we change color on hover */}
                                        {/* If we want white text on hover (when background becomes orangeish), we use this. */}
                                        {!isActive && (<span className="pill-label-hover absolute left-0 top-0 inline-flex items-center gap-2" style={{
                        color: 'var(--hover-text)', // e.g. White
                        willChange: 'transform, opacity'
                    }} aria-hidden="true">
                                                {item.icon && <span className="text-current w-4 h-4">{item.icon}</span>}
                                                {item.label}
                                            </span>)}
                                    </span>
                                </>);
            const baseClasses = 'relative overflow-hidden inline-flex items-center justify-center h-full rounded-full px-[var(--pill-pad-x)] transition-all duration-300 cursor-pointer select-none no-underline';
            const handleItemClick = (e) => {
                item.onClick?.(e);
            };
            return (<li key={item.href} role="none" className="h-full">
                                    {isRouterLink(item.href) ? (<Link to={item.href} className={baseClasses} style={currentStyle} aria-label={item.ariaLabel || item.label} onMouseEnter={() => handleEnter(i)} onMouseLeave={() => handleLeave(i)} onClick={handleItemClick}>
                                            {PillContent}
                                        </Link>) : (<a href={item.href} className={baseClasses} style={currentStyle} aria-label={item.ariaLabel || item.label} onMouseEnter={() => handleEnter(i)} onMouseLeave={() => handleLeave(i)} onClick={handleItemClick}>
                                            {PillContent}
                                        </a>)}
                                </li>);
        })}
                    </ul>
                </div>

                {/* Mobile Hamburger */}
                <button ref={hamburgerRef} onClick={toggleMobileMenu} aria-label="Toggle menu" aria-expanded={isMobileMenuOpen} className="md:hidden rounded-full border border-white/10 flex flex-col items-center justify-center gap-1.5 cursor-pointer p-0 relative ml-auto bg-white/5 hover:bg-white/10 transition-colors" style={{
            width: '40px',
            height: '40px',
        }}>
                    <span className="hamburger-line w-5 h-0.5 bg-white rounded-full origin-center transition-all"/>
                    <span className="hamburger-line w-5 h-0.5 bg-white rounded-full origin-center transition-all"/>
                </button>
            </nav>

            {/* Mobile Menu Dropdown */}
            <div ref={mobileMenuRef} className="md:hidden absolute top-[calc(100%+8px)] right-0 w-64 rounded-xl border border-white/10 shadow-2xl z-[999] overflow-hidden backdrop-blur-3xl" style={{
            background: 'rgba(2, 8, 23, 0.95)', // Deep dark bg
        }}>
                <ul className="flex flex-col p-2 gap-1">
                    {items.map(item => {
            const normalize = (p) => (p || '').replace(/\/$/, '') || '/';
            const isActive = normalize(activeHref) === normalize(item.href);
            const linkClasses = `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                ? 'bg-orange-500/10 text-orange-500' // Active in mobile
                : 'text-slate-300 hover:bg-white/5 hover:text-white'}`;
            const handleItemClick = (e) => {
                item.onClick?.(e);
                if (isMobileMenuOpen)
                    toggleMobileMenu();
            };
            return (<li key={item.href}>
                                {isRouterLink(item.href) ? (<Link to={item.href} className={linkClasses} onClick={handleItemClick}>
                                        {item.icon && <span className="w-4 h-4 opacity-70">{item.icon}</span>}
                                        {item.label}
                                    </Link>) : (<a href={item.href} className={linkClasses} onClick={handleItemClick}>
                                        {item.icon && <span className="w-4 h-4 opacity-70">{item.icon}</span>}
                                        {item.label}
                                    </a>)}
                            </li>);
        })}
                </ul>
            </div>
        </div>);
};
export default PillNav;
