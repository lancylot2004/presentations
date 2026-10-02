1. [Slide 3] How experienced are you with Git?
    Scale, no right answer.

2. [Slide 4 Click 1] How do we create a file from the command line?
    Multiple choice. Four options, one should be touch, other three should have two wrong one just about right. one-commands only.

    A. touch notes.txt          correct, and the one to land on
    B. : > notes.txt            just about right: works, but obscure
    C. mkfile 1k notes.txt      wrong: macOS/Solaris only, and makes a 1 KB file
    D. new notes.txt            wrong: no such command

    B was `> notes.txt`. Dropped: zsh sets NULLCMD=cat, so a bare redirection
    runs `cat > notes.txt` and sits waiting on stdin. It only creates the file
    and returns under bash and other POSIX shells, so the answer depended on
    which shell the room happened to be in. `: >` runs the null command
    instead and gives an empty file everywhere.

--- Demo 1: init, commit, branch, push ---

echo "Konstantinos Gkoutzis" > name.txt
git add name.txt
echo "Nick Wu" > name.txt
git commit -m "chore: Added name of professor."

3. [Demo 1] You run `git add notes.txt`, then add another line to notes.txt,
   then `git commit -m "..."`. Which version ends up in the commit?
    Trap. Most of the room will say the latest one. This is the whole reason
    the staging area exists, and it lands harder as a wrong answer than as a
    bullet point. Prove it live with git show straight afterwards.

    A. The version as it was when you ran git add   correct
    B. The latest version on disk                   the trap
    C. Both, as two commits                         wrong
    D. Neither, Git refuses and asks you to re-add  wrong

4. [Demo 1] You are on `numbered` with a commit on it. You run
   `git checkout main`. What happens to that commit?
    Trap. Switching branches feels destructive when you have never done it,
    and the files on disk really do change, which is what sells the wrong
    answer. Show the working tree changing, then switch back.

    A. Still there, on numbered                     correct
    B. Deleted, so commit before switching          the trap
    C. Moved onto main                              wrong
    D. Merged into main                             wrong

--- Demo 2: clone, pull, merge ---

5. [Demo 2] You committed an hour ago. Your partner pulls and still cannot
   see your change. What is missing?
    Opens the second demo and bridges from the first: a commit is local until
    it is pushed. Ask it while your own commit is sitting unpushed on screen.

    A. You have not pushed                          correct
    B. They need to pull again                      wrong
    C. You need to commit again                     wrong
    D. GitLab has not finished indexing             wrong

6. [Demo 2] Your push is rejected because Lucia pushed first. Someone on the
   internet tells you to run `git push --force`. What happens to her commit?
    Trap, and the most useful one in the deck. They will meet this advice in
    a real group project. Ask it at the rejection, before showing git pull.

    A. It is no longer on main on the server        correct
    B. Git merges the two automatically             the trap
    C. Nothing, --force only affects tags           wrong
    D. Git refuses, --force cannot overwrite others wrong

    Spare, if one lands flat: "You run `git commit` with no -m. What happens?"
    Answer: it opens an editor for the message, which is where half the room
    meets vim. Cheap to demo, and saves a lab question.

TODO:
- Refine good points
- Walkt through entire presentation, tech stuff, especially demo.