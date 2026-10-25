import React, { useEffect } from 'react';
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom';

import MarkdownPage from './components/MarkdownPage.jsx';
import { PAGES, SECTIONS } from './pages.js';

export default function App () {
    const location = useLocation();

    // ページを移ったら、先頭から表示する。
    // (scrollTo は Promise を返すブラウザがあるので、戻り値を返さないように {} で囲む)
    useEffect(()=> {
        window.scrollTo(0, 0);
    }, [location.pathname]);

    return (
        <div className="layout">
          <header className="header">
            <Link to="/">iHub マニュアル</Link>
          </header>

          <nav className="nav">
            {SECTIONS.map(section=> (
                <div key={section.label} className="nav-section">
                  <div className="nav-label">{section.label}</div>

                  {section.pages.map(page=> (
                      <NavLink key={page.path} to={page.path} end className="nav-link">
                        {page.title}
                      </NavLink>
                  ))}
                </div>
            ))}
          </nav>

          <main className="main">
            <Routes>
              {PAGES.map((page, i)=> (
                  <Route key={page.path}
                         path={page.path}
                         element={<MarkdownPage page={page} prev={PAGES[i - 1]} next={PAGES[i + 1]}/>}/>
              ))}

              <Route path="*" element={<NotFound/>}/>
            </Routes>
          </main>
        </div>
    );
}

function NotFound () {
    return (
        <article className="page">
          <h1>ページが見つかりません</h1>
          <p><Link to="/">iHub とは</Link> から読んでください。</p>
        </article>
    );
}
