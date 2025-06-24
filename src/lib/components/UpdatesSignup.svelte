<script>
  import EmailSubscribe from './EmailSubscribe.svelte';
</script>

<section class="updates-signup">
  <div class="content-container">
    <div class="text-content">
      <h2>Stay Updated</h2>
      <p>Get the latest news and updates about ReachScore's inclusive job posting tools and features.</p>
      
      <div class="subscribe-form">
        <EmailSubscribe 
          buttonText="Subscribe" 
          placeholder="Enter your email" 
          successMessage="Thank you! We'll keep you updated."
        />
      </div>
    </div>
  </div>
</section>

<style>
  .updates-signup {
    padding: 4rem 2rem;
    background-color: #f9fafb;
    border-radius: 1rem;
    margin: 2rem 0;
  }
  
  .content-container {
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .text-content {
    max-width: 600px;
  }
  
  h2 {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 1rem;
    color: #111827;
  }
  
  p {
    font-size: 1rem;
    color: #4b5563;
    margin-bottom: 2rem;
    line-height: 1.5;
  }
  
  .subscribe-form {
    margin-top: 1.5rem;
  }
  
  @media (max-width: 640px) {
    .updates-signup {
      padding: 3rem 1.5rem;
    }
    
    h2 {
      font-size: 1.5rem;
    }
  }
</style>
