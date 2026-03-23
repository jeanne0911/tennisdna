// ========== 8道风格测试题目 ==========
// 每道题4个选项，A=猛兽 B=磨王 C=突击 D=社交
// 选项对应的 type 字段用于计分
export const questions = [
  {
    id: 1,
    emoji: '🎾',
    question: '你打出一个好球后，更可能？',
    options: [
      { text: '再狠狠干一拍', type: 'beast' },
      { text: '继续稳住别乱', type: 'grinder' },
      { text: '想换个打法试试', type: 'striker' },
      { text: '这球挺舒服的😄', type: 'social' },
    ]
  },
  {
    id: 2,
    emoji: '🔄',
    question: '长回合（10拍+）你更倾向？',
    options: [
      { text: '找机会结束', type: 'beast' },
      { text: '一直磨下去', type: 'grinder' },
      { text: '找机会变节奏', type: 'striker' },
      { text: '差不多就行😄', type: 'social' },
    ]
  },
  {
    id: 3,
    emoji: '🏟️',
    question: '你更喜欢哪种球局？',
    options: [
      { text: '对攻很爽', type: 'beast' },
      { text: '多拍来回', type: 'grinder' },
      { text: '节奏变化多', type: 'striker' },
      { text: '轻松打打', type: 'social' },
    ]
  },
  {
    id: 4,
    emoji: '💪',
    question: '面对比你强的对手，你会？',
    options: [
      { text: '想硬刚', type: 'beast' },
      { text: '稳住慢慢打', type: 'grinder' },
      { text: '找机会打乱节奏', type: 'striker' },
      { text: '当体验局', type: 'social' },
    ]
  },
  {
    id: 5,
    emoji: '👀',
    question: '打球时你更关注？',
    options: [
      { text: '压制对手', type: 'beast' },
      { text: '少失误', type: 'grinder' },
      { text: '节奏变化', type: 'striker' },
      { text: '气氛轻松', type: 'social' },
    ]
  },
  {
    id: 6,
    emoji: '😵',
    question: '如果状态不好，你会？',
    options: [
      { text: '还是想狠狠干', type: 'beast' },
      { text: '更稳一点', type: 'grinder' },
      { text: '换个打法', type: 'striker' },
      { text: '随便打打', type: 'social' },
    ]
  },
  {
    id: 7,
    emoji: '🏁',
    question: '打完一场球后，你一般会？',
    options: [
      { text: '还想再来一场过过瘾', type: 'beast' },
      { text: '觉得今天状态还挺稳的', type: 'grinder' },
      { text: '回想刚才有没有更好的打法', type: 'striker' },
      { text: '聊聊天，慢慢收拾回去', type: 'social' },
    ]
  },
  {
    id: 8,
    emoji: '📞',
    question: '如果和别人约球，你更在意？',
    options: [
      { text: '能不能打得爽、对抗强', type: 'beast' },
      { text: '能不能稳定多拍', type: 'grinder' },
      { text: '对方有没有变化、好不好打', type: 'striker' },
      { text: '人好不好相处', type: 'social' },
    ]
  },
];

// ========== 4种球场人格类型 ==========
export const resultTypes = {
  beast: {
    id: 'beast',
    name: '猛兽型',
    subtitle: '进攻',
    emoji: '🦁',
    color: '#ef4444',
    star: '阿丽娜·萨巴伦卡',
    starPhoto: '/static/image_1774023770_1_1.jpg',
    starDesc: '暴力发球+底线平击进攻，WTA发球均速前三，用绝对力量碾压一切',
    desc: '喜欢主动进攻，节奏快，打球有压制力，容易打出精彩球',
    traits: ['主动进攻', '节奏快', '压制力强', '容易打出精彩球'],
    stats: { attack: 95, stability: 55, variety: 60, vibe: 50 },
  },
  grinder: {
    id: 'grinder',
    name: '磨王型',
    subtitle: '稳定',
    emoji: '🐢',
    color: '#10b981',
    star: '拉法·纳达尔',
    starPhoto: '/static/image_1774023782_1_1.jpg',
    starDesc: '红土磨王，场均跑动超5公里，超级上旋防守反击，永不放弃精神的代言人',
    desc: '节奏稳定、失误少，擅长多拍，是"最好搭"的类型之一',
    traits: ['节奏稳定', '失误率低', '擅长多拍', '最好搭之一'],
    stats: { attack: 55, stability: 95, variety: 50, vibe: 65 },
  },
  striker: {
    id: 'striker',
    name: '突击型',
    subtitle: '变化',
    emoji: '⚡',
    color: '#06b6d4',
    star: '卡洛斯·阿尔卡拉斯',
    starPhoto: '/static/image_1774023793_1_1.jpg',
    starDesc: '标志性"节奏断层"战术+全场移动如八爪鱼，突然变速变线让对手措手不及',
    desc: '节奏多变，不按套路出牌，很容易打乱对手',
    traits: ['节奏多变', '不按套路', '容易打乱对手', '变化丰富'],
    stats: { attack: 75, stability: 60, variety: 95, vibe: 55 },
  },
  social: {
    id: 'social',
    name: '社交型',
    subtitle: '轻松',
    emoji: '🎉',
    color: '#a855f7',
    star: '格里戈尔·迪米特罗夫',
    starPhoto: '/static/image_1774023814_1_1.png',
    starDesc: '优雅球风、球场魅力十足，享受比赛过程，球友眼中最有亲和力的球员',
    desc: '打球轻松不卷，氛围感强，和你打球通常很舒服',
    traits: ['轻松不卷', '氛围感强', '打球很舒服', '快乐网球'],
    stats: { attack: 45, stability: 60, variety: 50, vibe: 95 },
  },
};

// ========== 搭子匹配逻辑 ==========
// 找"打得舒服的人"，不是找一样的人
export const matchTable = {
  beast: {
    best: { id: 'striker', matchEmoji: '💥', matchName: '节奏爆破组', reason: '节奏+进攻，打起来最刺激' },
    others: [
      { id: 'grinder', matchEmoji: '🧱', matchName: '攻防拉扯局', reason: '经典攻防对抗，互相激发' },
      { id: 'social',  matchEmoji: '😄', matchName: '降火局', reason: '氛围轻松，节奏切换' },
    ],
  },
  grinder: {
    best: { id: 'grinder', matchEmoji: '🧘', matchName: '无限回合局', reason: '最稳的搭配，磨到天荒地老' },
    others: [
      { id: 'beast',   matchEmoji: '🎯', matchName: '消耗战专家', reason: '经典攻防搭配，消耗克制' },
      { id: 'striker', matchEmoji: '🎲', matchName: '节奏干扰局', reason: '节奏变化带来新体验' },
    ],
  },
  striker: {
    best: { id: 'beast', matchEmoji: '⚡', matchName: '高能对攻局', reason: '进攻+变化，最具观赏性' },
    others: [
      { id: 'grinder', matchEmoji: '🧠', matchName: '拆解对手局', reason: '你负责打乱节奏，策略拉满' },
      { id: 'striker', matchEmoji: '🎭', matchName: '混乱快乐局', reason: '两个变化型，精彩但混乱' },
    ],
  },
  social: {
    best: { id: 'social', matchEmoji: '😄', matchName: '快乐网球局', reason: '最轻松的搭配，快乐加倍' },
    others: [
      { id: 'grinder', matchEmoji: '🛟', matchName: '不被虐局', reason: '稳定+轻松，安全舒适' },
      { id: 'beast',   matchEmoji: '😂', matchName: '被带飞局', reason: '节奏反差大，体验刺激' },
    ],
  },
};

// 类型优先级（平分时使用）：猛兽 > 突击 > 磨王 > 社交
export const typePriority = ['beast', 'striker', 'grinder', 'social'];
