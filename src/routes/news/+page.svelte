<script>
  // News posts data
  const posts = [
    {
      id: 1,
      title: "JobPostScore Beta is Now Live",
      date: "July 17, 2025",
      content: "We're excited to announce the beta launch of JobPostScore! Our AI-powered job posting audit tool is now available for early adopters. The beta includes all core features for analyzing and improving job descriptions, with more enhancements coming soon.",
      author: "The JobPostScore Team"
    }
  ];
</script>

<div class="max-w-3xl mx-auto py-12 px-4 pt-32 sm:px-6 lg:px-8">
  <h1 class="text-3xl font-bold mb-24">News & Updates</h1>
  
  {#each posts as post}
    <article class="mb-12 border-2 rounded-2xl p-6 border-gray-900 pb-8 bg-white">
      <h2 class="text-2xl font-semibold mb-2">{post.title}</h2>
      <div class="text-sm text-gray-500 mb-4">
        {post.date} · {post.author}
      </div>
      <p class="text-gray-700 leading-relaxed">
        {post.content}
      </p>
    </article>
  {/each}
</div>
