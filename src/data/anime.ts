/* EDIT ME: the anime log — add shows as they come back to memory. */
export interface Anime {
  title: string;
  jp: string;
  color: string;
  note: string;
  status: 'finished' | 'watching' | 'rewatching';
}

export const ANIME: Anime[] = [
  { title: 'Attack on Titan', jp: '進撃の巨人', color: '#8A3B2E', note: 'peak fiction. argue with the walls.', status: 'finished' },
  { title: 'Vinland Saga', jp: 'ヴィンランド・サガ', color: '#2C5AB0', note: 'i have no enemies.', status: 'finished' },
  { title: 'Death Note', jp: 'デスノート', color: '#1B1B22', note: 'the original 200-IQ duel. take a potato chip…', status: 'finished' },
  { title: 'Demon Slayer', jp: '鬼滅の刃', color: '#0E7A5C', note: 'the sketchbook wall? mostly this one’s fault.', status: 'watching' },
  { title: 'Naruto', jp: 'ナルト', color: '#C4571F', note: 'the blueprint for never giving up.', status: 'finished' },
  { title: 'Tokyo Revengers', jp: '東京リベンジャーズ', color: '#B03A66', note: 'time travel via handshake. crying via everything.', status: 'finished' },
  { title: 'Spy x Family', jp: 'スパイファミリー', color: '#F2A93B', note: 'waku waku. elite comfort television.', status: 'watching' },
];
