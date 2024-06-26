document.addEventListener('DOMContentLoaded', () => {
    const progressBar = document.getElementById('progress-bar');
    let lastScrollY = window.scrollY;
  
    const updateProgressBar = () => {
      const scrollY = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrollPercentage = (scrollY / scrollHeight) * 100;
      
      progressBar.style.width = `${scrollPercentage}%`;
  
      if (scrollY > lastScrollY) {
        // Scrolling down
        progressBar.style.backgroundColor = '#007bff'; // Blue
      } else {
        // Scrolling up
        progressBar.style.backgroundColor = 'red'; // Red
      }
  
      lastScrollY = scrollY;
    };
  
    window.addEventListener('scroll', updateProgressBar);
  });
 
  

