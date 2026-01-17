<h1>ARCHIVIO DIDATTICO CENTRO YEP</h1>

<p>
  Questa pagina è stata sviluppata sotto commissione. L'obbiettivo era creare un sistema accessibile dal sito web pre-esistente in grado di immagazzinare file.
</p>

<h3>SPECIFICHE DI PROGETTO</h3>
<p>
  Mi è stato richiesto la minimizzazione della funzione dei costi costi, allora ho valutato queste opzioni:
</p>
<ul>
  <li>Non utilizzare DB esterni</li>
  <li>Memorizzare tutti i file PDF all'interno del File System dell'hosting (pochi KB quindi ok)</li>
</ul>

<h3>SPECIFICHE DI REALIZZAZIONE</h3>
<p>
  La pagina si basa su elementi web basici: <strong>HTML</strong>, <strong>CSS</strong>, <strong>JS</strong> e <strong>PHP</strong>.
</p>

<h5>Iterazione 1</h5>
<p>
  Ho cercato di capire i requisiti necessari. <br>
Dopo di che ho unito i prototipi dati da Stich e Codex IDE ottenendo a un primo mockup della pagina, poi migliorato.
</p>

<h5>Iterazione 2</h5>
<p>
  Effettiva realizzazione dell'archivio dei documenti tramite un JSON che tiene traccia di tutti i documenti e le informazioni associate ad essi. <br>
  Ero partito da una struttura completamente basic di soli form, dove ogni materia era un form che portava i dati necessari ad uno script PHP che proseguiva la lettura del JSON e alla stampa della pagina in modo dinamico.
</p>

<h5>Iterazione 3</h5>
<p>
  Miglioramento della realizzazione del sistema della stampa dinamica dei documenti.
  Infatti ho organizzato tutto in endpoint PHP racchiusi in <code>api.php</code> che chiamo tramite client con una <code>fetch</code> in modo che sia tutto responsive.
</p>

<p>
  Questi endpoint si occupano di tutta la gestione del JSON ritornando:
</p>
<ul>
  <li>
    <strong>materie:</strong> lista delle materie e classi di uni in modo dinamico, indicate in <code>subject_pool.php</code>
  </li>
  <li>
    <strong>documenti:</strong> "pescati" dal JSON <code>archive_index.json</code> in <code>/Config</code> che ne tiene traccia
  </li>
  <li><strong>errori lato server</strong></li>
</ul>

<p>
  Tutto in formato <strong>JSON</strong>.
  Gli endpoint sfruttano varie classi per tenere il JSON in formato consistente.
</p>
