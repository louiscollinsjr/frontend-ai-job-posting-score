<!-- learn more about jobpostscore -->
<script>
    import { createEventDispatcher } from "svelte";
  
    const dispatch = createEventDispatcher();
  
    const handleClose = () => {
      dispatch("close");
    };
  </script>
  
  <div class="relative overflow-hidden text-slate-900 font-aeonik pt-32 mb-12 sm:mb-64">
    <button
      class="absolute right-6 top-6 inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium uppercase tracking-[0.24em] text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
      type="button"
      aria-label="Close"
      on:click={handleClose}>
      Close
    </button>
  
    <div class="mx-auto max-w-6xl space-y-20 px-6 py-16 text-left sm:px-10 lg:px-16">
      <section class="flex flex-col items-center gap-12">
        <div class="w-full max-w-3xl space-y-6">
          <p class="mx-auto max-w-xl text-center text-sm tracking-wide text-slate-400">Introducing JobPostScore.com</p>
          <h2 class="mx-auto max-w-2xl text-center text-4xl font-medium text-slate-900 sm:text-5xl">JobPostScore: Every posting should reach the right candidate</h2>
          <p class="mx-auto max-w-2xl text-center text-lg leading-relaxed text-slate-600">With AI-powered analysis, JobPostScore helps talent teams turn job postings into optimized discovery engines—applying the same structured data standards that power Google Jobs, LinkedIn, and every major hiring platform.</p>
        </div>

        <div class="relative flex w-full justify-center my-12">
          <slot name="heroImage">
            <img
              src="/withsebs_Ultra-sharp_high-speed_shutter_commercial-style_stock__b46b76eb-7347-4574-ab8a-a2ce1a83eca4.png"
              alt="Team collaborating on job posting optimization"
              class="h-auto w-full max-w-6xl rounded-sm object-cover"
            />
          </slot>
        </div>
      </section>

      <div class="h-px bg-slate-200"></div>

      <section class="flex flex-col items-center gap-12">
        <div class="w-full max-w-3xl space-y-5">
          <h3 class="text-3xl font-medium text-slate-900">The hidden cost of unclear job postings</h3>
          <p class="text-lg leading-relaxed text-slate-600">Hiring isn't just about finding talent. It's about being found. "When you post a job, you're competing with millions of other listings," says [Your Name/Title]. "If your posting doesn't match how candidates search, or how algorithms scan, you're invisible. And invisibility is expensive."</p>
          <p class="text-lg leading-relaxed text-slate-600">Modern candidates expect clarity—precise role descriptions, transparent compensation, and posts that surface when they search. Meanwhile, hiring platforms and AI-powered job aggregators demand structured data, specific formatting, and schema compliance just to feature your listing.</p>
          <p class="text-lg leading-relaxed text-slate-600">For talent acquisition teams managing dozens of openings, maintaining that standard consistently is nearly impossible. A developer role might score high on technical clarity but miss location keywords. A leadership post might have perfect structure but lack salary transparency required by state law. And without visibility into why applications are low, teams keep posting—and waiting.</p>
          <blockquote class="border-l-4 border-slate-200 pl-4 text-lg italic text-slate-600 mt-8">"You can have the best role in the world, but if the posting doesn't meet the standards that hiring platforms require, candidates never see it."
          </blockquote>
        </div>

        <div class="relative flex w-full justify-center mt-12">
          <slot name="sectionOneImage">
            <img
              src="/emanbeing_Six_diverse_business_people_sitting_in_a_line_against_4856635f-0640-4ac0-a415-b2ddf1aa2c62.png"
              alt="Team collaborating on job posting optimization"
              class="h-auto w-full max-w-5xl rounded-sm object-cover"
            />
          </slot>
        </div>
      </section>

      <div class="h-px bg-slate-200"></div>

      <section class="flex flex-col items-center gap-12">
        <!-- <div class="flex w-full justify-center">
          <slot name="sectionTwoImage">
            <div class="flex h-full min-h-[240px] w-full max-w-3xl items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center text-sm text-slate-400">
              Insert diagnostic visuals or score breakdowns.
            </div>
          </slot>
        </div> -->

        <div class="w-full max-w-3xl space-y-5">
          <h3 class="text-3xl font-medium text-slate-900">Scoring what matters: visibility, clarity, compliance</h3>
          <p class="text-lg leading-relaxed text-slate-600">JobPostScore was built to close that gap. Using AI-powered analysis and schema validation, the platform evaluates every job posting against the seven dimensions that determine whether it gets seen, understood, and clicked:</p>
          <ul class="space-y-3 text-lg leading-relaxed text-slate-600">
            <li><strong class="font-medium text-slate-900">Clarity &amp; Readability:</strong> Is the role immediately understandable, or buried in buzzwords?</li>
            <li><strong class="font-medium text-slate-900">Search Alignment:</strong> Does it match how candidates actually search for jobs?</li>
            <li><strong class="font-medium text-slate-900">Structured Data:</strong> Is it machine-readable for Google Jobs and aggregators?</li>
            <li><strong class="font-medium text-slate-900">Recency &amp; Freshness:</strong> How long has it been live? Are urgency signals present?</li>
            <li><strong class="font-medium text-slate-900">Keyword Targeting:</strong> Are the right role, level, location, and skill terms included?</li>
            <li><strong class="font-medium text-slate-900">Compensation Transparency:</strong> Is salary disclosed per compliance requirements?</li>
            <li><strong class="font-medium text-slate-900">Page Context:</strong> Is the content clean, organized, and focused?</li>
          </ul>
          <p class="text-lg leading-relaxed text-slate-600">The result is a 100-point score with category-level diagnostics—showing teams exactly where each posting falls short and how to fix it. "We didn't want another checkbox tool," says [Your Name]. "We wanted something that explains why a posting isn't working and gives you the insights to improve it immediately."</p>
        </div>
      </section>

      <div class="h-px bg-slate-200"></div>

      <section class="flex flex-col items-center gap-12">
        <div class="w-full max-w-3xl space-y-5">
          <h3 class="text-3xl font-medium text-slate-900">From audit to optimization in minutes</h3>
          <p class="text-lg leading-relaxed text-slate-600">JobPostScore works in three steps:</p>
          <ol class="space-y-3 text-lg leading-relaxed text-slate-600">
            <li><strong class="font-medium text-slate-900">Analyze:</strong> Paste a job URL or raw text. The platform parses structure, extracts keywords, and validates schema compliance—the same way hiring platforms scan content.</li>
            <li><strong class="font-medium text-slate-900">Diagnose:</strong> Within seconds, the system returns a detailed scorecard with category breakdowns, flagged issues, and improvement recommendations powered by OpenAI.</li>
            <li><strong class="font-medium text-slate-900">Optimize:</strong> Export findings, track version changes, and re-score optimized drafts to measure improvement over time.</li>
          </ol>
          <p class="text-lg leading-relaxed text-slate-600">Behind the scenes, JobPostScore combines deterministic metrics—sentence length, keyword presence, structured data validation—with LLM-based assessments of readability and search alignment. It's a hybrid approach designed to be both consistent and contextually aware.</p>
          <blockquote class="border-l-4 border-slate-200 pl-4 text-lg italic text-slate-600 mt-8">"It's not just about getting a score," says [TA Professional]. "It's about understanding what the score means. If a posting is missing location modality or has vague compensation language, I need to know that before we go live—not after applications dry up."
          </blockquote>
        </div>

        <!-- <div class="flex w-full justify-center">
          <slot name="sectionThreeImage">
            <div class="flex h-full min-h-[240px] w-full max-w-3xl items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center text-sm text-slate-400">
              Insert workflow or process illustration.
            </div>
          </slot>
        </div> -->
      </section>

      <div class="h-px bg-slate-200"></div>

      <section class="flex flex-col items-center gap-12">
        <!-- <div class="flex w-full justify-center">
          <slot name="sectionFourImage">
            <div class="flex h-full min-h-[240px] w-full max-w-3xl items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center text-sm text-slate-400">
              Insert success metrics or testimonial visuals.
            </div>
          </slot>
        </div> -->

        <div class="w-full max-w-3xl space-y-5">
          <h3 class="text-3xl font-medium text-slate-900">Building confidence into every posting</h3>
          <p class="text-lg leading-relaxed text-slate-600">Early users are seeing tangible impact:</p>
          <ul class="space-y-3 text-lg leading-relaxed text-slate-600">
            <li><strong class="font-medium text-slate-900">Faster optimization cycles:</strong> What once required multiple review rounds now happens in a single audit.</li>
            <li><strong class="font-medium text-slate-900">Higher visibility:</strong> Posts optimized for schema and keywords surface in more aggregator feeds.</li>
            <li><strong class="font-medium text-slate-900">Compliance confidence:</strong> Built-in checks for pay transparency and structured data requirements stay ahead of regulation.</li>
            <li><strong class="font-medium text-slate-900">Consistent quality:</strong> Benchmark postings across roles, departments, and hiring managers with shared standards.</li>
          </ul>
          <p class="text-base leading-relaxed text-slate-600">The platform also supports guest audits, letting teams experiment with scoring before committing—making it easy for hiring managers to get quick feedback without workflow disruption.</p>
          <blockquote class="border-l-4 border-slate-200 pl-4 text-lg italic text-slate-600 mt-8">"Every job posting is a discovery problem, the right candidate is searching. Your job is to make sure you show up in their results. That's what we're optimizing for."
          </blockquote>
        </div>
      </section>

      <div class="h-px bg-slate-200"></div>

      <section class="flex flex-col items-center gap-12">
        <div class="w-full max-w-3xl space-y-5">
          <h3 class="text-3xl font-medium text-slate-900">What's next: enterprise intelligence for hiring</h3>
          <p class="text-lg leading-relaxed text-slate-600">JobPostScore is expanding its capabilities to include version tracking, team collaboration tools, and integrations with major ATS platforms. Future releases will add industry-specific benchmarks and compliance checks tailored to geographic requirements.</p>
          <p class="text-lg leading-relaxed text-slate-600">"There's a massive opportunity here," says [Your Name]. "Every company is hiring. Every company is posting jobs. But very few are thinking about those postings as structured, optimized content. That's what we're changing."</p>
          <p class="text-lg leading-relaxed text-slate-600">For talent teams, the goal is simple: make every job posting work harder—so the right candidates see it, understand it, and apply.</p>
          <blockquote class="border-l-4 border-slate-200 pl-4 text-lg italic text-slate-600 mt-8">"We're in the business of connecting talent with opportunity. With the right analysis, we can do that faster and better than ever before."
          </blockquote>
        </div>

        <!-- <div class="flex w-full justify-center">
          <slot name="sectionFiveImage">
            <div class="flex h-full min-h-[240px] w-full max-w-3xl items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center text-sm text-slate-400">
              Insert roadmap or integration imagery.
            </div>
          </slot>
        </div> -->
      </section>

      <div class="h-px bg-slate-200"></div>

      <section class="mx-auto flex w-full max-w-3xl flex-col items-start gap-6 rounded-2xl bg-slate-50 px-8 py-10 sm:px-12">
        <h3 class="text-2xl font-medium text-slate-900">Ready to optimize your job postings?</h3>
        <p class="max-w-2xl text-base leading-relaxed text-slate-600">Launch your first audit to uncover instant opportunities for clarity, visibility, and compliance—or explore a sample report to see how teams benchmark their roles with JobPostScore.</p>
        <div class="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <a class="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-700" href="/">Run Your First Audit</a>
         
        </div>
      </section>
    </div>
  </div>
  