
## About VoiceFlow

VoiceFlow is a vocal training platform designed specifically for musicians and singers, enabling them to warm up their voices before performances. Whether you're a beginner or an advanced performer, VoiceFlow offers a range of customizable exercises tailored to suit every skill level. The platform allows users to choose between diverse personalized warm-up routines, helping them gradually improve their vocal technique.

In addition to the exercises, VoiceFlow provides an engaging way for users to monitor their progress over time, allowing them to visualize improvements and continue refining their vocal abilities adding some aspects from the broader field of _gamification_. Our goal is to create a comprehensive space where singers and musicians alike can prepare their voices for any performance, all while fostering growth and development.

One of the main aspects of the project, the _pitch tracker_ developed as a key aspect of the training game, was also furtherly developed, and a dedicated page for this useful tool was also added. [MODIFY ]

This project was developed as the final project for the Advanced Coding Tools and Methodology course in the Music and Acoustic Engineering program at Politecnico di Milano by Michele Zanardi, Gianluigi Vecchini, Federico Capitani, and İpek Ceren Bayram.

[VOICEFLOW initial page image]

## Technologies Used

### Web API, Tone.js and the Salamander Piano

One of the most important aspect of the training game is the designing of the piano keyboard: it is powered by modern Web Audio APIs, such as the Tone.js JavaScript library throught the use of its Tone.Sampler(). The samples used are the ones from the well-known Salamander Grand Piano set on GitHub, based on the popular Yamaha G5 Grand Piano and recorded in high quality.

### FireBase FireStore Integration

In order to include in the project a large database of diverse exercises and various personalized workouts, as well as all the aspects related to the _login_ functions for the users, a FireBase FireStore database was set up. FireStore is a NoSQL realtime database that uses Collections and Documents instead of tables and rows, perfect for scalability, real-time applications and large quantities of data. The structure of the database for this application is easy to mantain, as it can be seen in the next image.

[IMAGE OF FIREBASE]

### "Microphone Integration"

MICROPHONE INTEGRATION

[SOME IMAGES?]

### "Tuner"

Tuner?

[SOME IMAGES?]

## User experience

1. Choice between Tuner and Training
    * Tuner
2. Level choice
3. Training time
4. Range selector
    * Predefined range
    * Manual selector
    * Pitch detection
5. Equipment
6. Training page
7. Login functionality
8. Results page and standings
