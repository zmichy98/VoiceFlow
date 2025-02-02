
![](vocal_trainer/settings/logo.png)

## About VoiceFlow

VoiceFlow is a vocal training platform designed specifically for musicians and singers, enabling them to warm up their voices before performances. Whether you're a beginner or an advanced performer, VoiceFlow offers a range of customizable exercises tailored to suit every skill level. The platform allows users to choose between diverse personalized warm-up routines, helping them gradually improve their vocal technique.

In addition to the exercises, VoiceFlow provides an engaging way for users to monitor their progress over time, allowing them to visualize improvements and continue refining their vocal abilities in the broader context of _gamification_. Our goal is to create a comprehensive space where singers and musicians alike can prepare their voices for any performance, all while fostering growth and development.

One of the main aspects of the project, the _pitch tracker_ developed as a key aspect of the training game, was also furtherly developed, and a dedicated page for this useful tool was also added. [MODIFY ]

This project was developed as the final project for the Advanced Coding Tools and Methodology course in the Music and Acoustic Engineering program at Politecnico di Milano by Michele Zanardi, Gianluigi Vecchini, Federico Capitani, and İpek Ceren Bayram.

[VOICEFLOW initial page image or NOT]

## Technologies Used

### Web API, Tone.js and Salamander Grand Piano

One of the most important aspect of the training game is the designing of the piano keyboard: it is powered by modern Web Audio APIs, such as the Tone.js JavaScript library throught the use of its Tone.Sampler(). The samples used are the ones from the well-known Salamander Grand Piano set on GitHub, based on the popular Yamaha G5 Grand Piano and recorded in high quality.

### FireBase FireStore Integration

In order to include in the project a large database of diverse exercises and various personalized workouts, as well as all the aspects related to the _login_ functions for the users, a FireBase FireStore database was set up. FireStore is a NoSQL realtime database that uses Collections and Documents instead of tables and rows, perfect for scalability, real-time applications and large quantities of data. The structure of the database for this application is easy to mantain, as it can be seen in the next image.

[IMAGE OF FIREBASE]

### "Microphone Integration"

**MICROPHONE INTEGRATION**

[SOME IMAGES?]

### "Tuner"

**Tuner?**

[SOME IMAGES?]

## User experience (Tutorial? Quick guide?)

Let's have a quick look to the main functionalities of VoiceFlow.

The main page let us choose between the Vocal Trainer and the Pitch Tracker.

[INDEX IMAGE]

The second choice will lead us to the "Pitch Tracker" page, where we can tune our instruments or find the pitch of a note using a simple yet powerful interface.

[TUNER image]

We can also select the "Login" button, and we will be redirected to the login interface. Here we can create our account or log in with our credentials.

[CREATE and LOGIN images]

Let's go back to the initial page and choose "Trainer". We will be redirected to the first of a series of "fine tunings" for our vocal workout. In this case, we have to choose our skill level between "Beginner", "Intermediate" and "Advanced".

[LEVEL image]

We will then have to choose how much time we have for the training, using the big slider in the center of the page.

[TIME image]

The next selection is the most refined: we can choose our voice type using three different methods. The first one allow us to decide between the six main vocal ranges (soprano, mezzosoprano, alto, tenor, baritone and bass). The second one is thought for "pro" users: if you know your specific range, you can input it via a virtual keyboard. The last one is instead thought for less experienced users who wants to find their vocal range. **[COME FUNZIONA? ]**

[4 IMAGES of RANGE]

As many experienced singers know, there are a lot of tools that can help warm up your voice before a performance or just to exercise. We selected two popular SOVTE (Semi-Occluded Vocal Tract Exercises) tools, the Mask and the Lax Vox. If you have them, your workout will change accordingly!

[TOOLS image]

A quick recap page will lead us to the real workout page.

[RECAP image]

The Training Game Page is the heart of VoiceFlow. Here we can sing along the exercises and see in real time the points that we are getting during the game. When we are ready, we can press on the "BUTTON [TO CHANGE]" to start. 

[TRAINING GAME image]

As we finish our training, the results will appear automatically. If you are logged in and have managed to beat your best score for the current level, the application will let you know. And if you were good enough to enter the Top 10, your name and your score will be remembered along the ones of the champions!

[RESULTS image]

There is also a dedicated page for the Standings in the home page. All the best scores for Beginner, Intermediate and Advanced level are displayed here.

[STANDINGS image]
