#!/usr/bin/env node

const http = require('https');
const { Readability } = require('@mozilla/readability')
const { JSDOM } = require('jsdom');
const TurndownService = require('turndown')
const prettier = require('prettier')

const args = process.argv.slice(2); // The first two elements of process.argv are node and the script file, so we slice them off

// Checking if there are any arguments passed
if (args.length === 0) {
  console.log('No url provided. Please provide an url.');
  process.exit(1); // Exit the script with a non-zero exit code
}

// Getting the first argument passed
const url = args[0];

// Using the argument in the script
console.log('Fetching ', url);

const prettierConfig = {
  parser: 'markdown',
  proseWrap: 'always',
  printWidth: 66,
}

const turndownService = new TurndownService({
  headingStyle: 'atx',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
  emDelimiter: '*',
  strongDelimiter: '**',
  linkStyle: 'referenced',
  linkReferenceStyle: 'full',
})

// We do not support images yet
// turndownService.remove('img')

http.get(url, (res) => {
  let data = '';

  res.setEncoding('utf8');
  
  res.on('data', (chunk) => {
    data += chunk; // Accumulate data chunks
  });

  res.on('end', async () => {
    const doc = new JSDOM(data, { url });

    const allLinks = doc.window.document.querySelectorAll('a')
    https://rationalwiki.org/wiki/Gamergate
    allLinks.forEach(link => {
      // link.href.startsWith('#') && 
      // if (link.textContent.trim() === "") {
      //     link.parentNode.removeChild(link);
      // }
      const span = doc.window.document.createElement('span');
      span.textContent = link.textContent;
      link.parentNode.replaceChild(span, link);
    });
    const allImgs = doc.window.document.querySelectorAll('img')
    allImgs.forEach(img => {
      img.parentNode.removeChild(img);
    });
    const reader = new Readability(doc.window.document);
    const readable = reader.parse();
    const markdown = turndownService.turndown(readable.content)
    const prettified = await prettier.format(markdown, prettierConfig)
    console.clear()
    process.stdout.write(prettified);
  });
}).on('error', (error) => {
  console.error('Error fetching document:', error);
});
