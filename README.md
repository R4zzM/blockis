Blockis
=======

A Tetris-like game, built using HTML5 and JS.

<b>Instructions</b><br>
To tryout the game just point your browser to r4zzm.github.com/blockis
Press any button to start the game once the page has loaded. To play again 
after a failure just refresh the page.  

The vim-naviagation inspired controlscheme is the following:
h - move block left<br/>
l - move block right<br/>
f - rotate block clockwise<br/>
d - rotate block counter clockwise<br/>
k - softdrop / lockdown<br/>
l - harddrop<br/>

<b>The Backlog</b><br/>
Ranked by priority:
- Code cleanup.
- A start up screen that tells the user to 'press any key to start' along
with instructions on the controls.
- Fixing the rotation system. Today it is as undefined as it can be. There is 
also a known issue (the only one known) where is it possible to keep a piece 
alive for an endless duration as long as it is being rotated. This was
introduced to fix another bug. Anyway, the game should implement some kind of 
known "tetris-clone" rotation system and not an arbitrary one.
- "Next piece"
- Score.
- Everything else.