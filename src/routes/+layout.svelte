
<script>
    import 'normalize.css';
</script>

<div id="three"></div>

<header id="splash">
  <h1 class="brandtype">STUDIO <br/> TEMPORAL</h1>

  <nav>
      <ul>
        <li><a href="#about">about</a></li>
        <li><a href="#contact">contact</a></li>
        <li><a href="https://www.instagram.com/studio_temporal/">instagram</a></li>
      </ul>
  </nav>

  <div class="tagline">
    <h2>
      
      A design and technology studio
combining form-giving, industrial
design, electronics and programming
to craft playful interactions between
objects and people.

<!--We design and prototype objects and experiences that exist at the intersection of digital and physical worlds.--></h2>
  </div>

</header>

<main>

    <slot></slot>

</main>

<footer>
  <section id="contact">

    <div id="email-us">
    <h2>Get in touch</h2>
    <address>
      <p><em>hello [at] temporal [dot] dk</em></p>
    </address>
  </div>

  <div id="visit-us">
    <h2>Visit us</h2>
    <address>
    <p><em>Prags Boulevard 61 <br/>
      2300 Copenhagen S <br/>
      Denmark</em></p>
    </address>
  </div>
  </section>

  <section id="copyright">
    <p>&copy; Copyight 2020 Temporal</p>
  </section>

</footer>


