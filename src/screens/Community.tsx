import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Bar, Body, Button, Card, Chip, Confirm, H1, H2, Row, Screen, Sheet, Wrap } from '../components/ui';
import { CHALLENGES } from '../data/seed';
import { useStore, weekStats } from '../store';
import { useColors } from '../theme';
import { Post } from '../types';
import { inviteCode, timeAgo, uid } from '../util';

type Tab = 'feed' | 'circles' | 'challenges';

export default function Community() {
  const c = useColors();
  const { state, update } = useStore();
  const [tab, setTab] = useState<Tab>('feed');
  const [text, setText] = useState('');
  const [target, setTarget] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [code, setCode] = useState('');
  const [codeMsg, setCodeMsg] = useState('');
  const [menu, setMenu] = useState<Post | null>(null);
  const [confirmBlock, setConfirmBlock] = useState<Post | null>(null);
  const [toast, setToast] = useState('');

  const joined = state.circles.filter((x) => x.joined);
  const circleId = target ?? joined[0]?.id ?? null;
  const feed = state.posts
    .filter((p) => joined.some((j) => j.id === p.circleId) && !state.blocked.includes(p.author))
    .sort((a, b) => b.at - a.at);
  const week = weekStats(state);

  const post = () => {
    if (!text.trim() || !circleId) return;
    update((s) => ({ ...s, posts: [{ id: uid('p'), circleId, author: s.profile?.name ?? 'Me', text: text.trim(), at: Date.now(), cheers: 0, cheered: false, mine: true }, ...s.posts] }));
    setText('');
  };
  const cheer = (p: Post) => update((s) => ({ ...s, posts: s.posts.map((x) => (x.id === p.id ? { ...x, cheered: !x.cheered, cheers: x.cheers + (x.cheered ? -1 : 1) } : x)) }));
  const joinToggle = (id: string) => update((s) => ({ ...s, circles: s.circles.map((x) => (x.id === id ? { ...x, joined: !x.joined, members: x.members + (x.joined ? -1 : 1) } : x)) }));
  const createCircle = () => {
    if (!newName.trim()) return;
    update((s) => ({ ...s, circles: [...s.circles, { id: uid('c'), name: newName.trim(), about: 'Private circle. Share the invite code with people you trust.', code: inviteCode(), members: 1, joined: true, mine: true }] }));
    setNewName('');
  };
  const joinByCode = () => {
    const c0 = state.circles.find((x) => x.code === code.trim().toUpperCase());
    if (!c0) { setCodeMsg('No circle found with that code.'); return; }
    if (!c0.joined) joinToggle(c0.id);
    setCodeMsg(`Joined ${c0.name}.`);
    setCode('');
  };

  const challengeValue = (kind: 'sessions' | 'minutes' | 'mealDays') => (kind === 'sessions' ? week.sessions : kind === 'minutes' ? week.minutes : week.mealDays);

  return (
    <Screen>
      <H1>Community</H1>
      <Body dim>Private circles. You choose who sees what.</Body>
      <Row style={{ marginVertical: 12 }}>
        {(['feed', 'circles', 'challenges'] as Tab[]).map((t) => (
          <Chip key={t} role="tab" label={t[0].toUpperCase() + t.slice(1)} selected={tab === t} onPress={() => setTab(t)} />
        ))}
      </Row>

      {tab === 'feed' && (
        <>
          {joined.length === 0 ? (
            <Card tone="soft">
              <Body>Join a circle to see posts and cheer on others.</Body>
              <Button title="Find circles" small style={{ marginTop: 10, alignSelf: 'flex-start' }} onPress={() => setTab('circles')} />
            </Card>
          ) : (
            <Card>
              <TextInput
                value={text} onChangeText={setText} placeholder="Share a win or ask for support…" placeholderTextColor={c.sub}
                accessibilityLabel="Write a post" multiline
                style={{ color: c.ink, minHeight: 56, fontSize: 15, borderWidth: 1, borderColor: c.line, borderRadius: 12, padding: 10 }}
              />
              <Body dim style={{ marginTop: 8 }}>Post to:</Body>
              <Wrap>{joined.map((j) => <Chip key={j.id} label={j.name} selected={circleId === j.id} onPress={() => setTarget(j.id)} />)}</Wrap>
              <Button title="Post" small disabled={!text.trim()} onPress={post} style={{ alignSelf: 'flex-end' }} />
            </Card>
          )}
          {feed.map((p) => (
            <Card key={p.id}>
              <Row style={{ justifyContent: 'space-between' }}>
                <Text style={{ color: c.ink, fontWeight: '800' }}>{p.mine ? 'You' : p.author} <Text style={{ color: c.sub, fontWeight: '400' }}>· {state.circles.find((x) => x.id === p.circleId)?.name} · {timeAgo(p.at)}</Text></Text>
                {!p.mine && <Pressable accessibilityLabel="Post options" onPress={() => setMenu(p)} style={{ padding: 8 }}><Text style={{ color: c.sub, fontSize: 18 }}>⋯</Text></Pressable>}
              </Row>
              <Body style={{ marginVertical: 8 }}>{p.text}</Body>
              <Pressable
                accessibilityRole="button" accessibilityLabel={`Cheer. ${p.cheers} cheers`} accessibilityState={{ selected: p.cheered }} onPress={() => cheer(p)}
                style={{ alignSelf: 'flex-start', paddingHorizontal: 12, minHeight: 40, justifyContent: 'center', borderRadius: 999, backgroundColor: p.cheered ? c.soft : 'transparent', borderWidth: 1, borderColor: p.cheered ? c.primary : c.line }}
              >
                <Text style={{ color: c.ink }}>👏 {p.cheers}</Text>
              </Pressable>
            </Card>
          ))}
          {joined.length > 0 && feed.length === 0 && <Body dim>Nothing here yet. Be the first to post.</Body>}
        </>
      )}

      {tab === 'circles' && (
        <>
          <H2 style={{ marginTop: 0 }}>Join with an invite code</H2>
          <Card>
            <Row style={{ gap: 8 }}>
              <TextInput value={code} onChangeText={setCode} autoCapitalize="characters" placeholder="e.g. BEGIN7" placeholderTextColor={c.sub}
                accessibilityLabel="Invite code" style={{ flex: 1, color: c.ink, borderWidth: 1, borderColor: c.line, borderRadius: 12, padding: 10 }} />
              <Button title="Join" small onPress={joinByCode} />
            </Row>
            {!!codeMsg && <Body dim style={{ marginTop: 6 }}>{codeMsg}</Body>}
            <Body dim style={{ marginTop: 6, fontSize: 12 }}>Try BEGIN7, MORN24 or DESK99.</Body>
          </Card>
          <H2>Your circles & suggestions</H2>
          {state.circles.map((x) => (
            <Card key={x.id}>
              <Row style={{ justifyContent: 'space-between' }}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={{ color: c.ink, fontWeight: '800', fontSize: 16 }}>🔒 {x.name}</Text>
                  <Body dim>{x.about}</Body>
                  <Body dim style={{ fontSize: 12 }}>{x.members} member{x.members === 1 ? '' : 's'}{x.mine ? ` · invite code ${x.code}` : ''}</Body>
                </View>
                <Button title={x.joined ? 'Leave' : 'Join'} small variant={x.joined ? 'secondary' : 'primary'} onPress={() => joinToggle(x.id)} />
              </Row>
            </Card>
          ))}
          <H2>Create a private circle</H2>
          <Card>
            <Row style={{ gap: 8 }}>
              <TextInput value={newName} onChangeText={setNewName} placeholder="Circle name" placeholderTextColor={c.sub}
                accessibilityLabel="Circle name" style={{ flex: 1, color: c.ink, borderWidth: 1, borderColor: c.line, borderRadius: 12, padding: 10 }} />
              <Button title="Create" small disabled={!newName.trim()} onPress={createCircle} />
            </Row>
            <Body dim style={{ marginTop: 6, fontSize: 12 }}>Only people with your invite code can join. Admins never see your health data.</Body>
          </Card>
        </>
      )}

      {tab === 'challenges' && (
        <>
          <Body dim style={{ marginBottom: 8 }}>Progress is for the last 7 days.</Body>
          {CHALLENGES.map((ch) => {
            const on = state.challengesJoined.includes(ch.id);
            const v = challengeValue(ch.kind);
            return (
              <Card key={ch.id}>
                <Row style={{ justifyContent: 'space-between' }}>
                  <Text style={{ color: c.ink, fontWeight: '800', fontSize: 16, flex: 1 }}>{ch.emoji} {ch.title}</Text>
                  <Button title={on ? 'Joined ✓' : 'Join'} small variant={on ? 'secondary' : 'primary'}
                    onPress={() => update((s) => ({ ...s, challengesJoined: on ? s.challengesJoined.filter((i) => i !== ch.id) : [...s.challengesJoined, ch.id] }))} />
                </Row>
                {on && (
                  <View style={{ marginTop: 10 }}>
                    <Bar value={v} max={ch.target} />
                    <Body dim style={{ marginTop: 4 }}>{Math.min(v, ch.target)} / {ch.target}{v >= ch.target ? '  🎉 Completed!' : ''}</Body>
                  </View>
                )}
              </Card>
            );
          })}
        </>
      )}

      <Sheet visible={!!menu} title="Post options" onClose={() => setMenu(null)}>
        <Button title="Report post" variant="secondary" onPress={() => { setMenu(null); setToast('Thanks. Our moderators will review this post.'); }} style={{ marginBottom: 8 }} />
        <Button title={`Block ${menu?.author ?? ''}`} variant="danger" onPress={() => { setConfirmBlock(menu); setMenu(null); }} />
      </Sheet>
      <Confirm visible={!!confirmBlock} title={`Block ${confirmBlock?.author}?`} message="You won't see their posts any more. You can unblock in Settings." confirmLabel="Block" danger
        onCancel={() => setConfirmBlock(null)} onConfirm={() => { update((s) => ({ ...s, blocked: [...s.blocked, confirmBlock!.author] })); setConfirmBlock(null); }} />
      <Sheet visible={!!toast} title="Done" message={toast} onClose={() => setToast('')}><Button title="OK" onPress={() => setToast('')} /></Sheet>
    </Screen>
  );
}
