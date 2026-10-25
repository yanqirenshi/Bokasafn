import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Markdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';

// 外のサイトへのリンクは、別のタブで開く。
// マニュアルの中のリンクは、#/setup のように書く。
function Anchor (props) {
    const { href = '', children } = props;

    if (/^https?:/.test(href))
        return <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>;

    return <a href={href}>{children}</a>;
}

// Markdown のページを表示する。
// 改行は、そのまま改行として表示する。(1 文ごとに改行して書くため)
export default function MarkdownPage (props) {
    const { page, prev, next } = props;

    useEffect(()=> {
        document.title = `${page.title} | iHub マニュアル`;
    }, [page.title]);

    return (
        <article className="page">
          <Markdown remarkPlugins={[remarkGfm, remarkBreaks]} components={{ a: Anchor }}>
            {page.content}
          </Markdown>

          <div className="pager">
            {prev ? <Link to={prev.path}>← {prev.title}</Link> : <span/>}
            {next ? <Link to={next.path}>{next.title} →</Link> : <span/>}
          </div>
        </article>
    );
}
