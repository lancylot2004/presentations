---
theme: default
title: Introduction to Programming Utilities
info: |
  Lecture 2: Basics of Git and GitLab. DoCSoc, first-year Computing.
author: Lancelot Liu
colorSchema: dark
highlighter: shiki
mdc: true
transition: fade
exportFilename: git-presentation
fonts:
  sans: Inter
  mono: JetBrains Mono
  weights: '300,400,600,800'
drawings:
  persist: false
class: text-left title-slide
---

# Introduction to Programming Utilities

<div class="mt-8 text-3xl font-semibold">Lecture 2: Basics of Version Control with Git</div>

<!--
- Welcome to our second lecture!
- Setup Menti please.
- I'm Lancelot, DoCSoc webmaster
- Covering version control with Git.
- Did you all have lecture one yesterday? (Solicit nods or hand raise)
- Ask question or interrupt anytime - welcome to stay behind too, unrelated welcome.
-->

---
clicks: 2
---

# What is version control?

<FileSoup />

<!--
- [MENTI 1] Please be concise.
- I'm cruel - I'm not going to give you a definition. Not useful here.
- [CLICK] Without version control, looks like this. Mess.
- With version control, clean history, can audit history, can change, can collaborate.
-->

---
clicks: 4
---

# VCS

<VcsLandscape />

<!--
- [CLICK] Mercurial is OG. Minimally used - great concepts, poor adoption.
- [CLICK] Git is dominant. Everyone uses Git. Lots of shortcomings due to age.
- [CLICK] Alternatives _like_ jj, seeks to simplify / improve. Fun fact - interoperable.
- [CLICK] We'll be focusing on Git.
- Out of interest, does anyone know why Git is called Git? 
- "I'm an egotistical bastard, and I name all my projects after myself. First 'Linux', now 'git'."
- I'm gonna throw you in the deep end here, I'm gonna show you how its used.
- [MENTI 2]
-->

---
clicks: 14
---

# How Git works

<GitMechanics />

<!--
- Primary way to interact with Git is through a terminal. Explore GUIs at your own peril.
- Nah I'm joking - each to their own.
- PLEASE FEEL FREE TO FOLLOW ALONG ON LAPTOP, encouraged.
- [CLICK] First, let's create a *repository*. (Raise your hand if you understand the word repository.)
- Let's create some files! This is unrelated to git.
- [CLICK] We need Git to "care" about our files. We "add" it to an "index" area. This concept is _kinda_ unique to Git.
- If you don't add files, the next steps don't work!
- [CLICK] COMMIT. All important concept. A Git repository can be thought of has a long chain of commits. This is your history.
- [CLICK] do some more work another commit.
- [CLICK] "checkout". Git has something called branches. It also has something called tags and both are refs but we won't go over today. Search if interested.
- If you just have one linear history, imagine lots of people have to write to repository - always need most up to date.
- So instead people work in different branches. You can have many too - separate work.
- [CLICK] As I make new commits, the branch "moves" with me. Think of it like a bookmark - that's what jj calls it.
- [CLICK] Remember checkout? I can use it to teleport to any branch. git will delete, add, and edit files for me so that the files I'm looking at are exactly like how it was at this commit / branch.
- [CLICK] I've made a new commit. It's now not on the same branch. They will both have changes the other does not.
- [CLICK] give it a name. [CLICK] add some work [CLICK] go back to main.
- [CLICK] Origin. Think of origins as a contacts book - it's a remote place to store your repository. Let's add one. The usual process is you do work, and you "push" it to your origin so that other people can pull it.
- [CLICK] push.
- Demo time! I've shown you lots of commands. Please don't feel like you have to remember straight away. 
- Slide provided, but I don't recommend relying on them. Take the concept - you can just search what the commands are if you know whats possible.
-->

---
layout: center
---

# Demo
<!--
- watch -c -n 1 -d eza --tree --git
- Anyone with a terminal can do this with me right now.

SETUP
- mkdir notes && cd notes
- [MENTI 3]
- notes.txt:
    Hello from DoCSoc
- cat notes.txt

FIRST COMMIT
- git init
- git status          -> notes.txt untracked
- git add .
- git status          -> same file, now "Changes to be committed". Point at the difference.
- git commit -m "Says hello."
- git log --oneline   -> one commit, no parent

SECOND COMMIT
- Add a line:
    Hello from Lancy
- git add notes.txt
- Now add another line in front of them:
    Hello from Saim
  Do NOT re-add. Say so out loud.
- [MENTI 4]
- git commit -m "Adds more hellos."
- git status, cat hello.txt
- git restore hello.txt, cat hello.txt

BRANCH, THEN ** MENTI Q4 **
- git checkout -b formatted
- Add new lines between hellos.
- git add . && git commit -m "Adds line number between hellos."
- git log
- [MENTI 5]
- git checkout main
- cat notes.txt
- git log

REMOTE
- Show the empty project on GitLab first, so they see both ends.
- git remote add origin <GitLab URL>
- git remote -v
- git push -u origin main
- Refresh GitLab. Commits are there. Open the branch dropdown: only main.
- git push -u origin numbered    (if time) -> now both

OPTIONAL, IF YOU ARE ON A MAC
- Open the folder in Finder, then git status. .DS_Store has appeared.
- echo ".DS_Store" > .gitignore && git status -> gone
- Say: .gitignore is itself a file, so it gets committed like any other.

IF IT BREAKS
- git status is always the answer. Read what it suggests out loud.
- If an editor opens unexpectedly, that is vim: :q! and use -m instead.
- Worst case, the slide before this one has the whole thing already drawn.
-->

---
clicks: 4
---

# Platforms

<ForgeLandscape />

<!--
- We want collaboration. So far we've been working on our own computer - other people can't see.
- We need *PLATFORM* to store out work. 
- Again, like VCS, there are lots of options. YOu may have heard of [CLICK] GitHub.

-->

---
clicks: 6
---

# Working with other people

<GitCollaboration />

<!--
- [CLICK] Code is alrady on remote. For example, new exercise released for haskell hooray!!
- We use git clone to make a local copy. We don't need to add origin here - automatic since u cloned.
- [CLICK] Do some work.
- [CLICK] someone else does work and pushes it/ What's push? we'll explain... now
- [CLICK] PUsh. Oh no, doesn't work!
- [CLICK] Pull first. Git automatically resolve the fact that we both made edits. 
- More complex situations exist - different strategies for merging exist, beyond scope here. Search up merge, rebase, squash, conflicts/
- This is a merge commit - it combines more than one commit's worth of work.
- [CLICK] Push! Now works.
- Time to throw u in the deep end again.
-->

---
layout: center
---

# Demo
<!--


CLONE
- git clone <URL> demo-2
- cd demo-2 && git log --oneline
-->

---
clicks: 4
---

# Good practice

<GoodPractice />

<!--
- Good practice in git and in version control in general is widely argued over.
- There used to be advice that you should commit once per day - a very big tech thing to do.
- [CLICK]s, go over each.
- In general, to begin with, you'll only need clone, commit, push. Gradually get better and learn more.
- Wait til you hear about cherry picks!
- Thank you. Questions? 
- Stop after 10 minutes - let everyone go and let question people stay behind.
-->
