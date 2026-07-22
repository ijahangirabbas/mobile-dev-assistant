import { SrtParser } from './src/parser/SrtParser.js';
import { ChunkBuilder } from './src/chunking/ChunkBuilder.js';
import { FileInfo } from './src/models/FileInfo.js';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// ── Create a sample SRT ───────────────────────────────────────────────────
const srt = `1
00:00:01,000 --> 00:00:04,000
Hello and welcome to this React Native course.

2
00:00:05,000 --> 00:00:09,000
In this lesson we will cover the basics.

3
00:00:10,000 --> 00:00:14,000
Let us start with the fundamentals of components.

4
00:00:15,500 --> 00:00:19,000
Now we move on to state management in React.

5
00:00:20,000 --> 00:00:24,000
Redux is a popular choice for managing state.

6
00:00:25,000 --> 00:00:29,000
But Context API can also work for smaller apps.

7
00:00:30,500 --> 00:00:34,000
Next we look at navigation between screens.

8
00:00:35,000 --> 00:00:39,000
React Navigation is the most popular library.

9
00:00:40,000 --> 00:00:44,000
It supports stack tab and drawer navigators.

10
00:00:45,000 --> 00:00:48,000
That wraps up our introduction to React Native.`;

const dir = './class-subtitle/module-01/01_react-native-intro';
await mkdir(dir, { recursive: true });
await writeFile(dir + '/subtitle.srt', srt, 'utf-8');

// ── Build a FileInfo ──────────────────────────────────────────────────────
const fi = new FileInfo({
  raw: {
    absolutePath: path.resolve(dir + '/subtitle.srt'),
    relativePath: 'module-01/01_react-native-intro/subtitle.srt',
    moduleFolder: 'module-01',
    lessonFolder: '01_react-native-intro',
    fileName: 'subtitle.srt',
  },
  normalized: {
    courseName: 'class-subtitle',
    moduleNumber: 1,
    moduleFolderName: 'module-01',
    lessonNumber: 1,
    lessonTitle: 'react native intro',
    lessonSlug: 'react-native-intro',
  },
  file: { extension: '.srt', size: srt.length },
});

// ── Parse ─────────────────────────────────────────────────────────────────
const parser = new SrtParser();
const lesson = await parser.parse(fi);
console.log('Entries parsed:', lesson.stats.entryCount);
console.log('');

// ── Chunk ─────────────────────────────────────────────────────────────────
const builder = new ChunkBuilder({ windowSeconds: 15 });
const chunks = builder.build(lesson);

console.log('Chunks built:', chunks.length, '(15-second windows)');
console.log('');

for (const [i, c] of chunks.entries()) {
  console.log(`Chunk ${i + 1}  │  timeline: ${c.timeline}  │  subtitles: ${c.subtitleCount}`);
  console.log(`         │  id: ${c.id}`);
  console.log(`         │  text: ${c.text.slice(0, 90)}${c.text.length > 90 ? '...' : ''}`);
  console.log('');
}
