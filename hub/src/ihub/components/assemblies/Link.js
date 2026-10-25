import LinkOutSite from '../parts/LinkOutSite.js';
import LinkInSite  from '../parts/LinkInSite.js';
import LinkWBS     from '../parts/LinkWBS.js';

export default function Link (props) {
    const href = props.href;
    const children = props.children;
    const wbs_id = props.wbs_id;

    if (wbs_id)
        return <LinkWBS wbs_id={wbs_id}>{children}</LinkWBS>;

    if ('http'===href.substring(0,4))
        return <LinkOutSite href={href}>{children}</LinkOutSite>;

    return <LinkInSite href={href}>{children}</LinkInSite>;
}
