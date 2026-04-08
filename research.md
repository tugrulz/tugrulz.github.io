---
layout: research
---

<div class="research-page">

<h2>Turullab</h2>

<p class="turullab-rules-label">Rules:</p>
<ol class="turullab-rules">
  <li>Turullab is not Trollab</li>
  <li>Turullab is <strong>NOT</strong> Trollab</li>
  <li>Turullab does not exist. We are a subset of the <a href="https://smash.inf.ed.ac.uk">SMASH</a> group</li>
</ol>


<div class="team-photo-section" style="margin-top:2rem;">
<div class="team-photo-wrap">
  <img src="./assets/img/lab.jpeg" alt="Turullab team photo" class="team-photo-img">
</div>
</div>

<h2 id="team">Team</h2>

<ul>
{% for member in site.data.team.members %}
  <li><a href="{{ member.url }}">{{ member.name }}</a> ({{ member.role }})</li>
{% endfor %}
</ul>

<h2 id="alumni">Alumni</h2>

<ul>
{% for person in site.data.team.alumni %}
  <li>{{ person.name }} ({{ person.role }})</li>
{% endfor %}
</ul>

<h2>Projects</h2>

<div class="research-grid">

<div class="project-card">
<div class="project-card__icon" style="background:rgba(239,68,68,0.12); color:#ef4444;">
  <i class="fas fa-shield-halved"></i>
</div>
<div class="project-card__title">Misinformation &amp; Deepfakes</div>
<div class="project-card__desc">
  We study how false and misleading content spreads on social media — from coordinated inauthentic behaviour and state censorship to AI-generated deepfakes and synthetic media. We build detection methods and characterize the impact of these threats on public discourse.
</div>
<ul class="project-card__papers">
  <li><a href="https://arxiv.org/abs/2508.13375">State &amp; Geopolitical Censorship on Twitter (X) — CIKM 2025</a></li>
  <li><a href="https://arxiv.org/abs/2010.10600">Misleading Repurposing on Twitter — ICWSM 2023</a></li>
  <li><a href="https://arxiv.org/pdf/1910.07783.pdf">Ephemeral Astroturfing Attacks — Euro S&amp;P 2021</a></li>
  <li><a href="https://arxiv.org/abs/2105.13398">Tactical Reframing of Disinformation Campaigns — ICWSM 2021</a></li>
</ul>
</div>

<div class="project-card">
<div class="project-card__icon" style="background:rgba(168,85,247,0.12); color:#a855f7;">
  <i class="fas fa-robot"></i>
</div>
<div class="project-card__title">Human–AI Interaction</div>
<div class="project-card__desc">
  We study how people interact with AI assistants in high-stakes and sensitive domains — from romantic relationships and mental health support to legal and medical advice. A central question is how LLMs handle disagreement: when they defer, push back, or subtly steer a user's views. This connects to broader questions of epistemic authority — how AI systems shape what people believe, how they reason, and whom they trust.
</div>
<p class="project-card__funding">🏆 Awarded UoE Generative AI Lab Funding: £2,500</p>
<p class="project-card__coming-soon">Papers coming soon</p>
</div>

<div class="project-card">
<div class="project-card__icon" style="background:rgba(34,197,94,0.12); color:#22c55e;">
  <i class="fas fa-chart-network"></i>
</div>
<div class="project-card__title">Computational Social Science</div>
<div class="project-card__desc">
  We apply computational methods to understand large-scale social phenomena — including cross-partisan dynamics, political discourse across platforms, gender in online communication, and the methodological challenges of studying social media data.
</div>
<ul class="project-card__papers">
  <li><a href="https://arxiv.org/abs/2603.23027">Gendered Communication of Political Elites on Truth Social — WebSci 2026</a></li>
  <li><a href="https://arxiv.org/abs/2603.17901">Grievance Politics vs. Policy Debates — ICWSM 2026</a></li>
  <li><a href="https://arxiv.org/abs/2504.09376">Cross-Partisan Interactions on Social Media — ICWSM 2025</a></li>
  <li><a href="https://arxiv.org/pdf/2303.00902">The Impact of Data Persistence Bias — WebSci 2023</a></li>
</ul>
</div>

<div class="project-card">
<div class="project-card__icon" style="background:rgba(234,179,8,0.12); color:#eab308;">
  <i class="fas fa-flask"></i>
</div>
<div class="project-card__title">Automating Science &amp; Education</div>
<div class="project-card__desc">
  We explore how LLMs and multi-agent AI systems can accelerate scientific workflows and transform education — from automated opinion mining and structured election analysis to orchestrating agent collaborations that produce full data science research papers end-to-end. We are also building AI-assisted teaching tools and studying the epistemic implications of delegating scientific reasoning to generative models.
</div>
<ul class="project-card__papers">
  <li><a href="https://arxiv.org/abs/2304.03434">Opinion Mining from YouTube Captions Using ChatGPT — arXiv 2023</a></li>
</ul>
<p class="project-card__coming-soon">More papers coming soon</p>
</div>

</div>
</div>
