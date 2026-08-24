import { LS } from "@/lib/storage";

export const PRAYERS: any = {
  dry:{
    word:[
      {n:1,title:"Augustine's Confession",src:"Augustine, Confessions, 397 AD",text:"Late have I loved You, O Beauty ever ancient, ever new. Late have I loved You. But now — even in this numb season — I call out. You were within me, and I was outside. Break into my boredom. Shatter my religious autopilot."},
      {n:2,title:"The Empty Hands Prayer",src:"Desert Father, 4th century",text:"Lord, I come with empty hands and a dryer heart. I have no eloquence. I have no tears. I have only this: Help. That is the whole prayer."},
      {n:22,title:"Thomas Merton's Dark Prayer",src:"Thomas Merton, Thoughts in Solitude, 1958",text:"My Lord God, I have no idea where I am going. I do not see the road ahead of me. I cannot know for certain where it will end. Nor do I really know myself. But I believe that the desire to please You does in fact please You. I hope that I will never do anything apart from that desire."},
      {n:23,title:"The Numb Man's Cry",src:"Psalm 22:1-2, ancient",text:"My God, my God, why have you forsaken me? Why are you so far from saving me? I cry out by day, but you do not answer — by night, but I find no rest. Yet you are holy. I will keep crying."},
      {n:24,title:"Stay in Your Cell",src:"Desert Father, Abba Moses, 4th century",text:"Lord, I am staying. I am not running to distraction today. I am sitting in the dry room of my own soul, waiting for You. The desert fathers said: stay in your cell and your cell will teach you everything. I am here. Come."},
      {n:25,title:"Against Religious Performance",src:"Soren Kierkegaard, adapted",text:"Lord, keep me from being a man who says the right things and feels nothing. From wearing faith like a coat I never take off. From praying words that have no weight. Let something in me crack open and be real before You today."},
    ],
    brothers:[
      {n:3,title:"The Hermit's Confession",src:"St. Antony of Egypt, 3rd century",text:"I fled to the desert to be alone with You, but instead I found only myself — cold, distracted, and dry. Send me not an army, but one brother. One honest voice. One man who will say: I too am dry."},
      {n:26,title:"The Weight of Hiddenness",src:"Dietrich Bonhoeffer, Life Together, 1939",text:"He who is alone with his sin is utterly alone. Lord, I have been carrying this alone too long. The dryness is partly because I have no one who knows. Send me a brother who can stand in it with me."},
      {n:27,title:"The Iron Prayer",src:"Proverbs 27:17, Puritan tradition",text:"Iron sharpens iron, Lord — but iron that has gone cold cannot sharpen anything. Heat me again through the friction of honest brotherhood. Let a man speak truth into me that I cannot speak to myself."},
    ],
    discipline:[
      {n:4,title:"The Rule for the Numb",src:"St. Benedict, adapted, 6th century",text:"Lord, Benedict said: To labor is to pray. I have no prayer in me. So I will labor. I will make my bed. I will read one verse. I will kneel when I feel nothing. Let the small discipline of the body teach the lost discipline of the soul."},
      {n:28,title:"The Acre Prayer",src:"George MacDonald, adapted",text:"Lord, I cannot plow the whole field. But I can turn this one furrow in front of me. Not tomorrow's furrow. This one. That is the discipline I am offering You today. One furrow. Done faithfully."},
      {n:29,title:"The Returning Pilgrim",src:"Rule of Taize, adapted",text:"I will return to the simple things. Morning rising. One verse. Kneeling. Silence. I do not need a new strategy. I need to return to what I abandoned. Lord, receive my return."},
    ],
    prayer:[
      {n:5,title:"Prayers in Dryness",src:"C.S. Lewis, Letters to Malcolm",text:"Prayers offered in the state of dryness are those which please Him best. So I pray unto the void: I trust You. I do not feel You, but I trust You. That is my prayer. That is enough."},
      {n:30,title:"The Wordless Prayer",src:"Romans 8:26, ancient",text:"The Spirit intercedes for us with groans that words cannot express. Lord, I offer You groans today. I do not have the language for what I need. But You do. Translate my silence. Take my emptiness and fill it with whatever You know I need most."},
      {n:31,title:"Remain",src:"John 15:4, monastic tradition",text:"Remain in me. Lord, that is the whole instruction and I keep failing it. I leave. I drift. I forget. Draw me back. Not dramatically — just a quiet return to the vine. I am the branch. You are everything else."},
    ],
  },
  hungry:{
    word:[
      {n:6,title:"The Deer's Prayer",src:"Psalm 42, ancient",text:"As the deer pants for streams of water, so my soul pants for You, O God. My soul thirsts for the living God. I hunger for Your Word like hidden manna. Feed me from Your hand."},
      {n:32,title:"Open My Ears",src:"Origen of Alexandria, 3rd century",text:"Lord, I have read Your Word and seen only ink. Open the eyes of my heart. Let Scripture be not a mirror I glance at but a window I climb through. Show me the living God behind every verse. Make the Book breathe."},
      {n:33,title:"The Burning Road",src:"Luke 24:32, adapted",text:"Did not our hearts burn within us while he talked with us on the road and opened the Scriptures? Lord, make my heart burn again. Not with emotion but with recognition — the shock of truth landing in a place it was always meant to reach."},
      {n:34,title:"More Than Doctrine",src:"John 5:39-40, Puritan",text:"You search the Scriptures because you think that in them you have eternal life — and yet you refuse to come to Me. Lord, keep me from that error. Let Scripture be the arrow pointing to You, not the destination itself. I want the Person, not just the text."},
    ],
    brothers:[
      {n:7,title:"The Confessional Longing",src:"Dietrich Bonhoeffer, Life Together, 1939",text:"He who is alone with his sin is utterly alone. I do not want to be utterly alone. I want a brother to whom I can say: I am hungry for more, and ashamed of how little I want it."},
      {n:35,title:"Two Are Better",src:"Ecclesiastes 4:9-10, Celtic",text:"Two are better than one, because they have a good return for their labor: If either of them falls down, one can help the other up. Lord, I need the kind of brother who notices when I fall before I do. Give me that man. Let me be that man."},
      {n:36,title:"The Methodist Question",src:"John Wesley, Class Meeting, 18th century",text:"Lord, the early Methodists asked each other every week: How is it with your soul? Give me one man who will ask me that question and wait — actually wait — for an honest answer. And give me the courage to give one."},
    ],
    discipline:[
      {n:8,title:"The Holy Dissatisfaction",src:"A.W. Tozer, The Pursuit of God, 1948",text:"Lord, Tozer prayed: I want to want You. I long to be filled with longing. That is my prayer. Let that holy dissatisfaction drive me to discipline, not despair."},
      {n:37,title:"The Early Watch",src:"Mark 1:35, monastic",text:"Very early in the morning, while it was still dark, Jesus got up and went to a solitary place to pray. Lord, before the world wakes and makes its demands — before the phone and the noise — let me find that solitary place. Even five minutes. Give me the discipline of the early watch."},
      {n:38,title:"Channel the Hunger",src:"A.W. Tozer, adapted",text:"Lord, holy appetite is rare and precious. Most men spend their hunger on things that cannot satisfy. I want to spend mine on You. Channel this restlessness. Give it a discipline to pour into so it does not dissipate into distraction."},
    ],
    prayer:[
      {n:9,title:"The Jacob-Wrestle",src:"Genesis 32, Puritan tradition",text:"Lord, I will not let You go unless You bless me. I am not wrestling an angel. I am wrestling my own half-heartedness. I will stay in prayer until hunger becomes encounter."},
      {n:39,title:"The Ask",src:"Matthew 7:7-8",text:"Ask and it will be given to you; seek and you will find; knock and the door will be opened. For everyone who asks receives. Lord, I am asking. Not timidly, not as a formality. I am knocking. I expect You to open. I am hungry and I believe You feed the hungry."},
      {n:40,title:"Filled with the Fullness",src:"Ephesians 3:19-20",text:"That you may be filled to the measure of all the fullness of God — Lord, I want that. All of it. I do not want a partial God or a managed spirituality. I want the immeasurably more. Do in me what I cannot ask or imagine."},
    ],
  },
  growing:{
    word:[
      {n:10,title:"The Humble Scholar",src:"Origen of Alexandria, 3rd century",text:"I have read Your Word a hundred times. But every time I approach it, I am a beginner. Keep me humble. Keep me teachable. The moment I think I understand Scripture, I have stopped growing."},
      {n:41,title:"Let It Read Me",src:"Eugene Peterson, Eat This Book",text:"Lord, Peterson said the first reading gets the information, the second reading lets it read you. I want the second reading. Let Your Word examine me while I examine it. Let it ask the questions."},
      {n:42,title:"The Lectio Prayer",src:"Benedictine tradition, Lectio Divina",text:"Lord, I come to Your Word not to master it but to be mastered by it. I will read slowly. I will sit with the phrase that catches me. I will not move on until You have spoken. Take as long as You need."},
    ],
    brothers:[
      {n:11,title:"The Sharpening Prayer",src:"Proverbs 27:17, Puritan tradition",text:"Iron sharpens iron. But sharpening requires friction. Give me brothers who will not just affirm me but challenge me. Who will say: I see a blind spot — and say it in love."},
      {n:43,title:"The Accountability Covenant",src:"Early Methodist tradition, adapted",text:"Lord, let me be known. Not performed before — known. Let one man in my life have access to the real record of my week. Not my highlight reel. My actual story. Give me the courage to be that accountable."},
      {n:44,title:"Bear One Another's Burdens",src:"Galatians 6:2, adapted",text:"Carry each other's burdens, and in this way you will fulfill the law of Christ. Lord, I want to be the kind of man other men can put their weight on. And I want to find the man I can put mine on. Make the load shared. That is how You designed it."},
    ],
    discipline:[
      {n:12,title:"The Long Obedience",src:"Eugene Peterson, 1980",text:"Lord, growth comes from a long obedience in the same direction. Give me the discipline of staying. Of morning prayer when I would rather sleep. Of faithfulness no one will ever applaud."},
      {n:45,title:"The Hidden Years",src:"Luke 2:52, monastic",text:"And Jesus grew in wisdom and stature, and in favor with God and man. Thirty years hidden before three years public. Lord, I want the results without the hiddenness. Teach me to trust the long formation. Grow me in secret."},
      {n:46,title:"The Forty-Day Prayer",src:"Desert Fathers, adapted",text:"Lord, the desert fathers said nothing significant happens in less than forty days. Let me commit to something for forty days. Not to earn Your favor — to train my will. The discipline is the prayer."},
    ],
    prayer:[
      {n:13,title:"The Listening Prayer",src:"1 Samuel 3, Celtic tradition",text:"Speak, Lord, for Your servant is listening. I have done all the talking for years. Now teach me to listen. Let my prayers be half the volume and twice the attention."},
      {n:47,title:"The Intercessor",src:"Rees Howells, 20th century",text:"Lord, Rees Howells learned to pray until something broke — in him or in the situation. I give up too quickly. Teach me to stay in the place of intercession until I know I have been heard. Let me become a man who actually moves things in prayer."},
      {n:48,title:"The Prayer of Examen",src:"St. Ignatius of Loyola, 16th century",text:"Lord, at the end of this day I want to see it as You saw it. Where were You moving and I missed it? Where did I resist You? Where did grace show up? Give me eyes that can review a day and find You in it — even in the mundane, even in the failure."},
    ],
  },
  broken:{
    word:[
      {n:14,title:"The Lament Psalm",src:"Psalm 13, ancient",text:"How long, O Lord? Will You forget me forever? How long will You hide Your face from me? Look on me and answer, Lord my God. Give light to my eyes. But I trust in Your unfailing love."},
      {n:49,title:"Where Else Would I Go",src:"John 6:68, adapted",text:"Lord, when You asked the disciples if they would leave, Peter said: Lord, to whom shall we go? You have the words of eternal life. That is where I am tonight. Not full of faith — just out of alternatives. So here I am. Still."},
      {n:50,title:"The Valley Psalm",src:"Psalm 23:4, ancient",text:"Even though I walk through the darkest valley, I will fear no evil, for you are with me; your rod and your staff, they comfort me. Lord, I am in the valley. I cannot see the other side. But I choose to believe You are here — not watching from a distance but walking this exact ground with me."},
      {n:51,title:"He Has Been Here",src:"Isaiah 53:3-4",text:"He was despised and rejected by mankind, a man of suffering, familiar with pain. Surely he took up our pain and bore our suffering. Lord, You have been here. You know this place from the inside. Let that be enough for today."},
    ],
    brothers:[
      {n:15,title:"The Sitters' Prayer",src:"Job 2, monastic",text:"Lord, Job's friends sat with him in silence for seven days. That was their best moment. Send me friends who will just sit. Who will not fix, quote, or explain. Who will bring food and silence."},
      {n:52,title:"Weep With Me",src:"Romans 12:15, early church",text:"Rejoice with those who rejoice; mourn with those who mourn. Lord, I do not need someone to fix this. I need someone to mourn with me. Send me a man who is not afraid of grief. Who will not rush me to the resurrection before I have sat with the death."},
      {n:53,title:"The Hospital Ward",src:"Dietrich Bonhoeffer, adapted",text:"The church is not a community of the righteous but a community of sinners. We are all in the ward, Lord. Some are further along in recovery, some are just arriving. Nobody here is whole yet. Let me remember that about myself and about my brothers."},
    ],
    discipline:[
      {n:16,title:"One Small Act",src:"Ancient monasticism",text:"When everything is falling apart, make your bed. Lord, I cannot fix this crisis. But I can make my bed. I can read one verse. I can kneel for ten seconds. Let small disciplines hold me together."},
      {n:54,title:"The Holding Pattern",src:"Lamentations 3:26",text:"It is good to wait quietly for the salvation of the Lord. Lord, I do not want to wait. But if the discipline right now is simply to not run — not to numb, not to escape, not to fill the space — then that is what I offer. I will wait. Quietly."},
      {n:55,title:"The Refiner's Fire",src:"Malachi 3:3, adapted",text:"He will sit as a refiner and purifier of silver. Lord, the breaking is the refining. I do not want to waste this suffering. Let it purify something in me that could not be reached any other way."},
    ],
    prayer:[
      {n:17,title:"Gethsemane",src:"Matthew 26",text:"My Father, if it is possible, let this cup pass from me. Nevertheless, not as I will, but as You will. I am in the garden. I ask for another way. But I trust Your will more than my own."},
      {n:56,title:"The Groaning Prayer",src:"Romans 8:26",text:"The Spirit helps us in our weakness. We do not know what we ought to pray for, but the Spirit himself intercedes through wordless groans. Lord, I am offering groans today. The Spirit knows what to do with them. Take my wordless weight."},
      {n:57,title:"Out of the Depths",src:"Psalm 130:1-2, ancient",text:"Out of the depths I cry to you, Lord; Lord, hear my voice. Let your ears be attentive to my cry for mercy. Lord, I am not praying from strength or clarity. I am praying from the bottom. But the bottom is still inside the reach of Your hand."},
      {n:58,title:"The Night Watch",src:"Psalm 63:1, 6-7",text:"You, God, are my God, earnestly I seek you; I thirst for you, my whole being longs for you. On my bed I remember you; I think of you through the watches of the night. Because you are my help, I sing in the shadow of your wings."},
    ],
  },
  any:[
    {n:18,title:"The Serenity Prayer",src:"Reinhold Niebuhr, 1943",text:"God, grant me the serenity to accept the things I cannot change, courage to change the things I can, and wisdom to know the difference. Trusting that You will make all things right if I surrender to Your will."},
    {n:19,title:"The Prayer of Abandonment",src:"Charles de Foucauld, martyr, 1916",text:"Father, I abandon myself into Your hands. Do with me what You will. Whatever You may do, I thank You. I am ready for all. I accept all. Let only Your will be done in me."},
    {n:20,title:"Evening Prayer",src:"John Wesley, Journal, 1738",text:"Lord, I am not what I ought to be. I am not what I want to be. I am not what I hope to be. But by Your grace, I am not what I was. Let me sleep in Your peace tonight."},
    {n:21,title:"The Prison Wall Prayer",src:"Anonymous — found on a concentration camp wall, 1945",text:"I believe in the sun even when it is not shining.\nI believe in love even when I feel it not.\nI believe in God even when He is silent.\nAmen."},
    {n:59,title:"The Collect for Grace",src:"Book of Common Prayer, 1549",text:"O Lord, our heavenly Father, Almighty and everlasting God, who hast safely brought us to the beginning of this day: defend us in the same with thy mighty power; and grant that this day we fall into no sin, neither run into any kind of danger; but that all our doings may be ordered by thy governance, to do always that is righteous in thy sight. Amen."},
    {n:60,title:"The Breastplate of St. Patrick",src:"St. Patrick, 5th century Ireland",text:"Christ with me, Christ before me, Christ behind me, Christ in me, Christ beneath me, Christ above me, Christ on my right, Christ on my left, Christ when I lie down, Christ when I sit down, Christ when I arise. In the heart of every man who thinks of me, in the mouth of everyone who speaks of me."},
    {n:61,title:"The Prayer of St. Francis",src:"Attributed, 13th century",text:"Lord, make me an instrument of Your peace. Where there is hatred, let me sow love; where there is injury, pardon; where there is doubt, faith; where there is despair, hope; where there is darkness, light. Grant that I may not so much seek to be consoled as to console; to be understood as to understand; to be loved as to love."},
    {n:62,title:"The Jesus Prayer",src:"Desert Fathers, 5th century — used continuously for 1,500 years",text:"Lord Jesus Christ, Son of God, have mercy on me, a sinner.\n\nBreath in: Lord Jesus Christ, Son of God.\nBreath out: have mercy on me, a sinner.\n\nLet it become the rhythm underneath everything."},
    {n:63,title:"The Celtic Morning Prayer",src:"Celtic Christian tradition, adapted",text:"I arise today through God's strength to pilot me, God's might to uphold me, God's wisdom to guide me, God's eye to look before me, God's ear to hear me, God's word to speak for me, God's hand to guard me, God's way to lie before me. I arise today."},
    {n:64,title:"The Covenant Prayer",src:"John Wesley, Covenant Service, 1755",text:"I am no longer my own, but Thine. Put me to what Thou wilt, rank me with whom Thou wilt. Put me to doing, put me to suffering. Let me be employed for Thee or laid aside for Thee, exalted for Thee or brought low for Thee. Let me be full, let me be empty. I freely and heartily yield all things to Thy pleasure and disposal."},
    {n:65,title:"The Night Office",src:"Compline, ancient",text:"Be present, O merciful God, and protect us through the silent hours of this night, so that we who are wearied by the changes and chances of this fleeting world may repose upon Thy eternal changelessness. Amen."},
    {n:66,title:"The Warrior's Prayer",src:"Ephesians 6:10-12, adapted",text:"Lord, I remember today that my struggle is not against flesh and blood — not against the man who frustrates me, the situation that threatens me, or the weakness I despise in myself. My enemy is spiritual. My armor is Yours. Be my shield today."},
    {n:67,title:"Before Scripture",src:"Thomas Aquinas, before study, 13th century",text:"Creator of all things, true source of light and wisdom: graciously let a ray of Your light penetrate the darkness of my understanding. Give me a keen understanding, a retentive memory, the ability to grasp things correctly and to express them suitably. Amen."},
    {n:68,title:"The Publican's Prayer",src:"Luke 18:13, ancient",text:"God, have mercy on me, a sinner.\n\nThe Pharisee listed his accomplishments. The tax collector could only say this. Jesus said the tax collector went home justified. Lord, I come not with my record but with this seven-word prayer. It is enough."},
    {n:69,title:"For the Men Who Come After",src:"Chambers, adapted from Bonhoeffer",text:"Lord, let me be the kind of man who makes it easier for the men who come after me to believe. Who lives in such a way that my sons and brothers see in me a reason to trust You. Not a perfect man — a real one. One who kept going."},
  ],
};

// Prayers for the 11am-3pm "noonday demon" (acedia) window — the "dry"
// category is the closest thematic fit to spiritual listlessness.
export const NOONDAY_PRAYERS = PRAYERS.dry.word;

// Returns at most 3 prayers, truly randomized each time, favoring prayers
// the man hasn't seen recently so the same handful don't keep resurfacing.
export function selectPrayers(seasons: string[], needs: string[]){
  const MAX_PRAYERS = 3;
  const RECENT_KEY = "recentPrayerIds";
  const recent = LS.get(RECENT_KEY, []); // array of prayer n's seen recently, most recent first

  // Build the full matching pool (season x need), deduped
  const pool: any[] = [];
  const seen = new Set();
  seasons.forEach(s=>needs.forEach(n=>{
    (PRAYERS[s]?.[n]||[]).forEach(p=>{
      if(!seen.has(p.n)){ seen.add(p.n); pool.push(p); }
    });
  }));
  // Always mix in the "any" pool too, so results aren't narrowly repetitive
  PRAYERS.any.forEach(p=>{
    if(!seen.has(p.n)){ seen.add(p.n); pool.push(p); }
  });

  if(pool.length===0) return [PRAYERS.any[Math.floor(Math.random()*PRAYERS.any.length)]];

  // Weight selection away from recently-seen prayers so repeats feel diverse.
  // A prayer seen recently gets a much lower chance of being picked again.
  const weighted = pool.map(p=>{
    const recentIdx = recent.indexOf(p.n);
    const weight = recentIdx===-1 ? 10 : Math.max(1, 10 - (recent.length - recentIdx));
    return {p, weight};
  });

  const picks = [];
  const remaining = [...weighted];
  while(picks.length < MAX_PRAYERS && remaining.length > 0){
    const totalWeight = remaining.reduce((sum,w)=>sum+w.weight,0);
    let r = Math.random()*totalWeight;
    let idx = 0;
    for(let i=0;i<remaining.length;i++){
      r -= remaining[i].weight;
      if(r<=0){ idx=i; break; }
    }
    picks.push(remaining[idx].p);
    remaining.splice(idx,1);
  }

  // Update recency memory (keep last 20 seen, most recent first)
  const newRecent = [...picks.map(p=>p.n), ...recent].filter((v,i,a)=>a.indexOf(v)===i).slice(0,20);
  LS.set(RECENT_KEY, newRecent);

  return picks;
}



// ── DATA ──────────────────────────────────────────────────────

