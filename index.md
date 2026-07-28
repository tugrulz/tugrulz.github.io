---
layout: homepage
---

I’m an Assistant Professor in the School of Informatics at the University of Edinburgh, where I co-direct the [Social Media Analysis and Support for Humanity (SMASH)](https://smash.inf.ed.ac.uk) group. My research is on **AI & Social Media**: how LLMs claim epistemic authority and handle disagreement with the people who use them, how to detect AI-generated media at scale, and how multi-agent AI systems can automate scientific work and education. I am broadly interested in Natural Language Processing and Computational Social Science.

I teach [Computational Social Science](http://www.drps.ed.ac.uk/25-26/dpt/cxinfr08034.htm) and [Text Technologies in Data Science](https://www.drps.ed.ac.uk/25-26/dpt/cxinfr11229.htm), supervise [a lab of six](./research), and explain AI to a general audience on my [Turkish-language YouTube channel](https://www.youtube.com/@tugrulcan).

Previously, I was a Postdoctoral Scholar at [Indiana University at Bloomington's Observatory on Social Media (OSOME)](https://osome.iu.edu). I received my Ph.D. from [EPFL](https://www.epfl.ch) in 2022, and my B.S. from [Bilkent University](https://www.bilkent.edu.tr) in 2017, with a major in Computer Science and a minor in Philosophy. I also spent a semester at the [National University of Singapore](https://www.nus.edu.sg).

## News
- **2026** — Program Co-Chair, [ICWSM 2027](https://www.icwsm.org/2027/organisation/)
- **2026** — Book chapter published: [*An Optimistic Outlook on Teaching, Learning and Assessment for Coding With the Emergence of Generative AI*](https://teaching-programming.github.io/book/C10_teaching-with-genai.html)
- **2025** — *Understanding Society with Big Data: Computational Social Science* nominated for a University of Edinburgh Teaching Award
- **2025** — Organiser, [SICSS Edinburgh 2025](https://sicss.io/2025/edinburgh/people) (Summer Institute in Computational Social Science)
- **2025** — Awarded UoE Generative AI Lab funding for work on human–AI disagreement

## Teaching

### Courses
- [Understanding Society with Big Data: Computational Social Science](http://www.drps.ed.ac.uk/25-26/dpt/cxinfr08034.htm) 2026– *(nominated for a UoE Teaching Award)*
- [Evidence, Argument and Persuasion in a Digital Age](http://www.drps.ed.ac.uk/25-26/dpt/cxefie11080.htm) 2025–
- [Text Technologies in Data Science](https://www.drps.ed.ac.uk/25-26/dpt/cxinfr11229.htm) 2024– *(information retrieval & NLP)*
- [Introduction to Object Oriented Programming](http://www.drps.ed.ac.uk/25-26/dpt/cxinfr08029.htm) 2025
- Distributed Information Systems, EPFL, 2018–2021
- Applied Data Analysis, EPFL, 2018
- Introduction à la Programmation, EPFL, 2019

### AI Education & Public Engagement
- Organiser, [SICSS Edinburgh 2025](https://sicss.io/2025/edinburgh/people) — an intensive summer institute training researchers in computational methods
- Author, [*An Optimistic Outlook on Teaching, Learning and Assessment for Coding With the Emergence of Generative AI*](https://teaching-programming.github.io/book/C10_teaching-with-genai.html) — book chapter on teaching programming in the age of generative AI
- Creator, [Dr. Tuğrulcan Elmas](https://www.youtube.com/@tugrulcan) — Turkish-language YouTube channel explaining AI and social media research to a general audience
- Supervision: six current lab members across undergraduate, PhD and postdoctoral levels, plus four alumni ([lab page](./research))

## Team
{% for member in site.data.team.members -%}
- [{{ member.name }} ({{ member.role }})]({{ member.url }})
{% endfor %}

## Publications

<!-- TODO: add the arXiv/PDF links for the two preprints below once they are posted -->

- **How AI Models Manage Epistemic Authority: A Taxonomy and Comparative Analysis of Responses to User Disagreement**
  <br>
  **Tuğrulcan Elmas** <strong><i style="color:#e74d3c">Preprint</i></strong>

- **TRACE-Inset: Unified Whole-Image and Partial-Match Image Retrieval with Vision-Language Embeddings**
  <br>
  **Tuğrulcan Elmas** <strong><i style="color:#e74d3c">Preprint</i></strong>

<!-- TODO: add co-authors and the book title/editors for the chapter below -->

- **An Optimistic Outlook on Teaching, Learning and Assessment for Coding With the Emergence of Generative AI**
  <br>
  **Tuğrulcan Elmas** <strong><i style="color:#e74d3c">Book Chapter</i></strong>
  <br>
  [Chapter](https://teaching-programming.github.io/book/C10_teaching-with-genai.html)

- **Humans Cannot Detect AI-Generated Media But Communities May — For Now: Collaborative AI Detection in r/RealOrAI on Reddit**
  <br>
  **Tuğrulcan Elmas** <strong><i style="color:#e74d3c">Preprint</i></strong>
  <br>
  [PDF](https://arxiv.org/abs/2605.24287)

- **Israel-Hamas War on X: A Case Study of Coordinated Campaigns and Information Integrity**
  <br>
  **Tuğrulcan Elmas**, Filipi Nascimento Silva, Manita Pote, Priyanka Dey, Keng-Chi Chang, Jinyi Ye, Luca Luceri, Cody Buntain, Emilio Ferrara, Alessandro Flammini, Fil Menczer <strong><i style="color:#e74d3c">Preprint</i></strong>
  <br>
  [PDF](https://arxiv.org/abs/2604.10566)

- **ChatGPT vs Teachers vs Students: Large-Scale Analysis of Generative AI Discourse in Education Communities on Reddit**
  <br>
  Pelin Yüce, Xiangruo Dai, Rebecca Owens, **Tuğrulcan Elmas**
  <br>
  21st International Conference On Web And Social Media **ICWSM 2027**. <strong><i style="color:#e74d3c">Full Paper</i></strong>
  <br>
  [PDF](https://arxiv.org/abs/2605.17712)

- **Evaluating Image Forgery Detection and Propaganda in Manipulated Images of the Russian Trolls Campaign**
  <br>
  Basem Mohammed, Yusuf Mücahit Çetinkaya, **Tuğrulcan Elmas**
  <br>
  IEEE Internet Computing **2026**. <strong><i style="color:#e74d3c">Journal Paper</i></strong>
  <br>
  [PDF](https://ieeexplore.ieee.org/abstract/document/11557468) <button class="paper-abstract-toggle" aria-expanded="false"><span>Abstract</span><i class="fas fa-chevron-down"></i></button>
  <span class="paper-abstract" hidden>Generative AI tools have increased the scale and accessibility of deceptive image creation, but the robustness of existing forgery detection methods under emerging editing tools and real-world social media conditions remains uncertain. This study evaluates state-of-the-art image forgery detectors on recent benchmarks and applies the strongest model to a historical influence-campaign case study: Russian troll activity during the 2016 U.S. presidential election. We find that TruFor is the most consistent detector across legacy and recent datasets, but that its performance degrades on edits produced by advanced tools such as Nano Banana. We then deploy a multimodal pipeline combining forgery localization, Optical Character Recognition (OCR), face recognition, and visual-language-model-based annotation to characterize manipulated images in the campaign. Our analysis suggests that Russian troll accounts relied primarily on low-effort meme-style edits and ridicule-oriented reputation attacks, disproportionately targeting prominent U.S. political figures including Hillary Clinton, Bill Clinton, and Barack Obama.</span>

- **Gendered Communication Patterns of Political Elites on Truth Social**
  <br>
  Tom Bidewell, Artemis Deligianni, **Tuğrulcan Elmas**, Clare Llewellyn, Bjorn Ross
  <br>
  18th ACM Web Science Conference **WebSci 2026**. <strong><i style="color:#e74d3c">Full Paper</i></strong>
  <br>
  [PDF](https://arxiv.org/abs/2603.23027)

- **Grievance Politics vs. Policy Debates: A Cross-Platform Analysis of Conservative Discourse on Truth Social and Reddit**
  <br>
  Yining Wang, Alhasan Abdellatif, Artemis Deligianni, Hannah Hok, Yusuf Mücahit Çetinkaya, **Tuğrulcan Elmas**
  <br>
  20th International Conference On Web And Social Media **ICWSM 2026**. <strong><i style="color:#e74d3c">Full Paper</i></strong>
  <br>
  [PDF](https://arxiv.org/abs/2603.17901)

- **State & Geopolitical Censorship on Twitter (X): Detection & Impact Analysis of Withheld Content**
  <br>
  Yusuf Mücahit Çetinkaya, **Tuğrulcan Elmas**
  <br>
  The Conference on Information and Knowledge Management **CIKM 2025**. <strong><i style="color:#e74d3c">Short Paper</i></strong>
  <br>
  [PDF](https://www.arxiv.org/abs/2508.13375)

- **Density-aware Walks for Coordinated Campaign Detection**
  <br>
  Atul Anand Gopalakrishnan, Jakir Hossain, **Tuğrulcan Elmas**, Ahmet Erdem Sariyuce
  <br>
  European Conference on Machine Learning and Principles and Practice of Knowledge Discovery in Databases **ECML PKDD 2025**. <strong><i style="color:#e74d3c">Full Paper</i></strong>
  <br>
  [PDF](https://arxiv.org/abs/2506.13912)

- **Cross-Partisan Interactions on Social Media**
  <br>
  Yusuf Mücahit Çetinkaya, Vahid Ghafouri, Jose Such, Guillermo Suarez Tangil, **Tuğrulcan Elmas**
  <br>
  19th International Conference On Web And Social Media **ICWSM 2025**. <strong><i style="color:#e74d3c">Full Paper</i></strong>
  <br>
  [PDF](https://arxiv.org/abs/2504.09376)

- **Large Engagement Networks for Classifying Coordinated Campaigns and Organic Twitter Trends**
  <br>
  Atul Anand Gopalakrishnan, Jakir Hossain, **Tuğrulcan Elmas**, Ahmet Erdem Sariyuce
  <br>
  19th International Conference On Web And Social Media **ICWSM 2025**. <strong><i style="color:#e74d3c">Full Paper</i></strong>
  <br>
  [PDF](https://arxiv.org/abs/2503.00599)

- **Coordinated Reply Attacks in Influence Operations: Characterization and Detection**
  <br>
  Manita Pote, **Tuğrulcan Elmas**, Alessandro Flammini, Fil Menczer
  <br>
  19th International Conference On Web And Social Media **ICWSM 2025**. <strong><i style="color:#e74d3c">Full Paper</i></strong>
  <br>
  [PDF](https://arxiv.org/abs/2410.19272)

- **Toxic Synergy Between Hate Speech and Fake News Exposure**
  <br>
  Munjung Kim, **Tuğrulcan Elmas**, Filippo Menczer
  <br>
  International Workshop on Cyber Social Threats **CySoc 2024** (colocated with ICWSM 2024). <strong><i style="color:#e74d3c">Workshop Paper</i></strong>
  <br>
  [PDF](https://arxiv.org/abs/2404.08110)

- **#TeamFollowBack - Detection and Analysis of Follow Back Accounts**
  <br>
  **Tuğrulcan Elmas**, Mathis Randl, Youssef Attia
  <br>
  18th International Conference On Web And Social Media **ICWSM 2024**. <strong><i style="color:#e74d3c">Full Paper</i></strong>
  <br>
  [PDF](https://arxiv.org/abs/2403.15856)

- **Shorts vs. Regular Videos on YouTube: A Comparative Analysis of User Engagement and Content Creation Trends**
  <br>
  Caroline Violot, **Tuğrulcan Elmas**, Igor Bilogrevic, Mathias Humbert
  <br>
  16th ACM Web Science Conference **WebSci 2024**. <strong><i style="color:#e74d3c">Full Paper</i></strong>
  <br>
  [PDF](https://arxiv.org/abs/2403.00454)

- **Measuring and Detecting Virality on Social Media: The Case of Twitter's Viral Tweets Topic**
  <br>
  **Tuğrulcan Elmas**, Selim Stephane, Célia Houssiaux
  <br>
  ACM Web Conference 2023 **WebConf 2023**. <strong><i style="color:#e74d3c">Workshop Paper</i></strong>
  <br>
  [PDF](https://arxiv.org/abs/2303.06120) [Data](https://github.com/tugrulz/ViralTweets)

- **Analyzing Activity and Suspension Patterns of Twitter Bots Attacking Turkish Twitter Trends by a Longitudinal Dataset**
  <br>
  **Tuğrulcan Elmas**
  <br>
  International Workshop on Cyber Social Threats **CySoc 2023** (colocated with WebConf 2023). <strong><i style="color:#e74d3c">Workshop Paper</i></strong>
  <br>
  [PDF](https://arxiv.org/abs/2304.07907) [Data](https://github.com/tugrulz/EphemeralAstroturfing)

- **The Impact of Data Persistence Bias on Social Media Studies**
  <br>
  **Tuğrulcan Elmas**
  <br>
  15th ACM Web Science Conference **WebSci 2023**. <strong><i style="color:#e74d3c">Full Paper</i></strong>
  <br>
  [PDF](https://arxiv.org/pdf/2303.00902) [Data](https://github.com/tugrulz/DataPersistenceBias)

- **The Role of Compromised Accounts in Social Media Manipulation**
  <br>
  **Tuğrulcan Elmas** <strong><i style="color:#e74d3c">Ph.D. Thesis</i></strong>
  <br>
  [PDF](https://infoscience.epfl.ch/record/297318/files/EPFL_TH8991.pdf)

- **Misleading Repurposing on Twitter**
  <br>
  **Tuğrulcan Elmas**, Rebekah Overdorf, Karl Aberer
  <br>
  17th International Conference On Web And Social Media **ICWSM 2023**. <strong><i style="color:#e74d3c">Full Paper</i></strong>
  <br>
  [PDF](https://arxiv.org/abs/2010.10600)

- **Characterizing Retweet Bots: The Case of Black Market Accounts**
  <br>
  **Tuğrulcan Elmas**, Rebekah Overdorf, Karl Aberer
  <br>
  16th International Conference On Web And Social Media **ICWSM 2022**. <strong><i style="color:#e74d3c">Full Paper</i></strong>
  <br>
  [PDF](https://arxiv.org/abs/2112.02366) [Data](https://github.com/tugrulz/RetweetBots)

- **Ephemeral Astroturfing Attacks: The Case of Fake Twitter Trends**
  <br>
  **Tuğrulcan Elmas**, Rebekah Overdorf, Ahmed Furkan Özkalay, Karl Aberer
  <br>
  2021 IEEE European Symposium on Security and Privacy **Euro S&P 2021**. <strong><i style="color:#e74d3c">Full Paper</i></strong>
  <br>
  [PDF](https://arxiv.org/pdf/1910.07783.pdf) [Code](https://github.com/tugrulz/EphemeralAstroturfing)
  <br>
  Featured in [The Next Web](https://thenextweb.com/news/twitter-trending-topics-algorithm-has-vulnerability-hackers-using-ephemeral-astroturfing-attacks), [ACM Technews](https://technews.acm.org/archives.cfm?fo=2021-06-jun/jun-04-2021.html), [Le Temps](https://www.letemps.ch/societe/une-etude-lepfl-indique-20-tendances-twitter-faussees-contenus-ephemeres), [Mashable ME](https://me.mashable.com/tech/14085/turkish-twitter-being-flooded-with-fake-trends-created-by-bots-that-manipulate-algorithms), [Atlantic](https://www.theatlantic.com/technology/archive/2021/09/twitter-should-abolish-trending-topics/620026/), [Anadolu Agency](https://www.aa.com.tr/en/world/half-of-twitter-trending-topics-in-turkey-found-to-be-fake/2269405), [Milliyet](https://www.milliyet.com.tr/yazarlar/savas-onemli/epfl-arastirmasina-gore-turkiye-twitter-gundeminde-yer-alan-trendlerin-yarisi-sahte-6525080), [Hacker News](https://news.ycombinator.com/item?id=27368214), [Ekşi Sözlük](https://eksisozluk.com/2-haziran-2021-twitter-manipulasyon-ifsasi--6937655), Countless Others

- **WayPop Machine: A Wayback Machine to Investigate Popularity and Root Out Trolls**
  <br>
  **Tuğrulcan Elmas**, Thomas Romain Ibanez, Alexandre Hutter, Rebekah Overdorf, Karl Aberer
  <br>
  International Symposium on Foundations of Open Source Intelligence and Security Informatics **FOSINT-SI 2022** (colocated with ASONAM 2022). <strong><i style="color:#e74d3c">Workshop Paper</i></strong>
  <br>

- **A Dataset of State-Censored Tweets**
  <br>
  **Tuğrulcan Elmas**, Rebekah Overdorf, Karl Aberer
  <br>
  15th International Conference On Web And Social Media **ICWSM 2021**. <strong><i style="color:#e74d3c">Dataset Paper</i></strong>
  <br>
  [PDF](https://arxiv.org/pdf/2101.05919.pdf) [Data](https://zenodo.org/record/4439509)

- **Tactical Reframing of Disinformation Campaigns Against the Istanbul Convention**
  <br>
  **Tuğrulcan Elmas**, Rebekah Overdorf, Karl Aberer
  <br>
  Data for the Welbeing of Most Vulnerable **colocated with ICWSM 2021**. <strong><i style="color:#e74d3c">Workshop Paper</i></strong>
  <br>
  [PDF](https://arxiv.org/abs/2105.13398)

- **Can Celebrities Burst Your Bubble**
  <br>
  **Tuğrulcan Elmas**, Kristina Hardi, Rebekah Overdorf, Karl Aberer
  <br>
  Innovative Ideas in Data Science (colocated with **WebConf 2020**).
  <br>
  MISINFO (colocated with **WebConf 2021**). <strong><i style="color:#e74d3c">Workshop Paper</i></strong>
  <br>
  [PDF](https://arxiv.org/pdf/2003.06857.pdf)

- **Opinion Mining from YouTube Captions Using ChatGPT: A Case Study of Street Interviews Polling the 2023 Turkish Elections**
  <br>
  İlker Gül, **Tuğrulcan Elmas** <strong><i style="color:#e74d3c">Preprint</i></strong>
  <br>
  [PDF](https://arxiv.org/abs/2304.03434)

## Talks
- Invited Teaching Seminar at John Hopkins SAIS Conflicts and Cultures in Contemporary Turkey course by Lisel Hintz
- Panelist at AMLD 2025, Lausanne, Switzerland
- Speaker & Panelist at Scotsman Data Conference 2024, Edinburgh, UK
- Speaker & Panelist at Middle East Conference 2024, Doha, Qatar

## Services
- Program Co-Chair: [ICWSM 2027](https://www.icwsm.org/2027/organisation/)
- Organiser: [SICSS Edinburgh 2025](https://sicss.io/2025/edinburgh/people)
- PC Member: WebSci, ICWSM, CySoc
- Conference Reviewer: Euro S&P 2021, EDBT 2021, ICDE 2020, IEEE CIC 2019, CIKM 2019, WISE 2018, IEEE Big Data 2018
- Journal Reviewer: Turkish Journal Of Electrical Engineering & Computer Sciences, Online Social Networks and Media, EPJ Data Science, PeerJ, OSNEM

## Media
- Interviewed by [Ali Tarakçı](https://www.youtube.com/watch?v=UDcsgBqcQQ0)
- Interviewed by [Cüneyt Özdemir](https://www.youtube.com/watch?v=mxb-6Vbzz-I)
- Guest at [Dijital Hayat / TRT Radyo](https://www.youtube.com/watch?v=enAC3C_Q-44)
- Interviews while being the president of [Turquia1912](https://www.youtube.com/watch?v=GyJOCltA1Ak&list=PLrrZ8PX0n3IxYN9PcEGmJnGn4nvZypC2-)
- Prompted the Short Film [This AI Makes You Think 2X Faster](https://www.youtube.com/watch?v=S4CSIiUr3a0&t=1s)
- Directed the Short Film [Lemongrass](https://www.youtube.com/watch?v=_vbw9gL60gA)
- Turkish Youtube Channel [Dr. Tuğrulcan Elmas](https://www.youtube.com/@tugrulcan)

## Misc
- Deanonimized author of the popular Turkish blog [azimliyazar.blogspot.com](https://azimliyazar.blogspot.com) (4+ million views)
- President of Switzerland Turkish Student Association (2019-2021)
- Bilkent University Ultimate Frisbee Team (2015-2017) - Fencing Team (2017) - Orienteering Team (2015)
<!-- - Developer of @DisinfoNews - A Twitter Bot to share disinformation related tweets (https://twitter.com/DisinfoNews) -->
