import React, { useEffect, useRef, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Link from '@mui/material/Link';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { useDispatch, useSelector } from 'react-redux';

import {Leaf} from '@yanqirenshi/manipulater';

// 吹き出しの枠の色。(src/config/COLORS.js の main。null のときは manipulater の既定の色)
import { DOCK_COLOR } from '../ihub/manegers/colors.js';

// <markdown-workspace> などのカスタム要素を登録する。
import '@yanqirenshi/markdown.sitter';

import { fetchProjectsV2 } from '../ihub/redux/slices/scrumSlice.js';
import sogh from '../ihub/manegers/sogh.js';

// 吹き出しの大きさ
const LEAF_W = 1111;
const LEAF_H = 888;
// ボタンと吹き出しの間隔
const BRANCH_H = 33;
// 画面の端からの余白
const MARGIN = 8;

const QUERY_PROJECT_REPOSITORY = `
query ($projectId: ID!) {
  node(id: $projectId) {
    ... on ProjectV2 { repositories(first: 1) { nodes { id nameWithOwner } } }
  }
}`;

const MUTATION_CREATE_ISSUE = `
mutation ($repositoryId: ID!, $title: String!, $body: String) {
  createIssue(input: { repositoryId: $repositoryId, title: $title, body: $body }) {
    issue { id number url }
  }
}`;

const MUTATION_ADD_PROJECT_ITEM = `
mutation ($projectId: ID!, $contentId: ID!) {
  addProjectV2ItemById(input: { projectId: $projectId, contentId: $contentId }) {
    item { id }
  }
}`;

// sogh には Project にアイテムを追加する処理がないため、GraphQL API を直接呼ぶ。
async function graphql (query, variables) {
    const response = await fetch(sogh.endpoint(), {
        method: 'POST',
        headers: sogh.makeHeader(),
        body: JSON.stringify({ query, variables }),
    });

    const json = await response.json().catch(()=> null);

    if (!response.ok)
        throw new Error(json?.message || `HTTP ${response.status}`);

    if (json?.errors?.length)
        throw new Error(json.errors.map(e=> e.message).join('\n'));

    return json.data;
}

// Project に紐づいた先頭のリポジトリを、イシューの作成先にする。
// (GitHub の API に Project の Default repository の項目がないため)
async function fetchProjectRepository (project_id) {
    const data = await graphql(QUERY_PROJECT_REPOSITORY, { projectId: project_id });

    return data?.node?.repositories?.nodes?.[0] || null;
}

async function addIssueToProject (project_id, repository_id, title, body) {
    const created = await graphql(MUTATION_CREATE_ISSUE, {
        repositoryId: repository_id,
        title: title,
        body: body,
    });

    const issue = created.createIssue.issue;

    try {
        await graphql(MUTATION_ADD_PROJECT_ITEM, {
            projectId: project_id,
            contentId: issue.id,
        });
    } catch (e) {
        // イシューは作成できたので、どのイシューかが分かるようにする。
        e.issue = issue;
        throw e;
    }

    return issue;
}

function leafPosition (root) {
    const w_center = root.position.x + (root.size.w / 2);

    const x = Math.min(Math.max(MARGIN, w_center - (LEAF_W / 2)),
                       Math.max(MARGIN, window.innerWidth - LEAF_W - MARGIN * 3));
    const y = Math.max(MARGIN, root.position.y - BRANCH_H - LEAF_H);

    return { x, y };
}

export default function ProjectItemForm (props) {
    const root = props.root;

    const dispatch = useDispatch();
    const authed = useSelector(s=> s.githubAuth.value);
    const { status: projects_status, ids: project_ids } = useSelector(s=> s.scrum.projectsV2);

    const [project_id, setProjectId] = useState('');
    const [repository, setRepository] = useState({ status: 'idle', data: null, error: null });
    const [title, setTitle] = useState('');
    const [sending, setSending] = useState(false);
    const [result, setResult] = useState(null);

    const workspace = useRef(null);

    useEffect(()=> {
        if (authed===true && projects_status==='idle')
            dispatch(fetchProjectsV2());
    }, [authed, projects_status, dispatch]);

    useEffect(()=> {
        if (!project_id) {
            setRepository({ status: 'idle', data: null, error: null });
            return;
        }

        let canceled = false;

        setRepository({ status: 'loading', data: null, error: null });

        fetchProjectRepository(project_id)
            .then(repo=> !canceled && setRepository({ status: 'succeeded', data: repo, error: null }))
            .catch(e=> !canceled && setRepository({ status: 'failed', data: null, error: e.message }));

        return ()=> { canceled = true; };
    }, [project_id]);

    // ログイン中のアカウントの、閉じていない ProjectV2
    const projects = (Array.isArray(project_ids) ? project_ids : [])
          .map(id=> sogh.projectV2(id))
          .filter(p=> p && !p.core().closed);

    const repo = repository.data;
    const can_add = !!project_id && !!repo && title.trim()!=='' && !sending;

    const add = async ()=> {
        if (!can_add) return;

        setSending(true);
        setResult(null);

        try {
            const body = workspace.current ? workspace.current.value : '';
            const issue = await addIssueToProject(project_id, repo.id, title.trim(), body);

            setResult({ type: 'success', issue });

            setTitle('');
            if (workspace.current) workspace.current.value = '';
        } catch (e) {
            setResult({ type: 'error', message: e.message, issue: e.issue || null });
        } finally {
            setSending(false);
        }
    };

    const { x, y } = leafPosition(root);

    return (
        <Leaf x={x} y={y} w={LEAF_W} h={LEAF_H} theme_color={DOCK_COLOR || undefined}>
          <Box sx={{ height: '100%', boxSizing: 'border-box', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6">Project にイシューを追加</Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <FormControl size="small" sx={{ minWidth: 444 }}>
                <InputLabel id="project-item-form-project">Project</InputLabel>
                <Select labelId="project-item-form-project"
                        label="Project"
                        value={project_id}
                        disabled={sending}
                        onChange={e=> setProjectId(e.target.value)}>
                  {projects.map(p=> (
                      <MenuItem key={p.id()} value={p.id()}>{p.title()}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Destination authed={authed}
                           projects_status={projects_status}
                           project_id={project_id}
                           repository={repository}/>
            </Box>

            <TextField label="タイトル"
                       size="small"
                       required
                       fullWidth
                       value={title}
                       disabled={sending}
                       onChange={e=> setTitle(e.target.value)}/>

            <Box sx={{ flex: 1, minHeight: 0, border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden' }}>
              <markdown-workspace ref={workspace} mode="split" live="" style={{ display: 'block', height: '100%' }}>
                <markdown-editor slot="editor" placeholder="本文 (Markdown)"></markdown-editor>
                <markdown-viewer slot="preview"></markdown-viewer>
              </markdown-workspace>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Result result={result}/>
              </Box>

              <Button variant="contained" disabled={!can_add} onClick={add}>
                {sending ? '追加中...' : '追加'}
              </Button>
            </Box>
          </Box>
        </Leaf>
    );
}

function Destination (props) {
    const { authed, projects_status, project_id, repository } = props;

    if (authed!==true)
        return <Typography color="text.secondary">Github に接続していません。</Typography>;

    if (projects_status==='loading')
        return <Typography color="text.secondary">Project を読み込み中...</Typography>;

    if (projects_status==='failed')
        return <Typography color="error">Project を取得できませんでした。</Typography>;

    if (!project_id)
        return null;

    if (repository.status==='loading')
        return <Typography color="text.secondary">作成先を読み込み中...</Typography>;

    if (repository.status==='failed')
        return <Typography color="error">作成先を取得できませんでした。({repository.error})</Typography>;

    if (!repository.data)
        return <Typography color="error">この Project にはリポジトリが紐づいていません。</Typography>;

    return <Typography>作成先: {repository.data.nameWithOwner}</Typography>;
}

function Result (props) {
    const result = props.result;

    if (!result) return null;

    if (result.type==='success')
        return (
            <Typography>
              追加しました: <Link href={result.issue.url} target="_blank" rel="noopener noreferrer">{result.issue.url}</Link>
            </Typography>
        );

    return (
        <Typography color="error" sx={{ whiteSpace: 'pre-wrap' }}>
          {result.issue
           ? <>イシューは作成しましたが、Project に追加できませんでした。(<Link href={result.issue.url} target="_blank" rel="noopener noreferrer">{result.issue.url}</Link>)<br/></>
           : null}
          {result.message}
        </Typography>
    );
}
