let currentSong = new Audio();
let songs;
let currFolder;

function formatTime(seconds) {

    if (isNaN(seconds) || seconds < 0) {
        return "00:00"
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

// Example usage:
const seconds = 72; // Replace with your desired number of seconds
const formattedTime = formatTime(seconds);
//console.log(formattedTime); // Output: "01:12"



async function getSongs(folder) {
    currFolder = folder;
    let fetchData = await fetch(`http://127.0.0.1:5500/${folder}/`);
    let parsedData = await fetchData.text();
    //console.log(parsedData);

    let div = document.createElement("div");
    div.innerHTML = parsedData;
    let allA = div.getElementsByTagName("a");
    //console.log(allA)
    songs = [];

    for (let index = 0; index < allA.length; index++) {
        const element = allA[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    let songUL = document.querySelector(".songLists").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>
        
                            <img src="./assets/music.svg" alt="">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")}</div>
                                <div>Song Artist</div>
                            </div>

                            <div class="playnow">
                                <span>Play Now</span>
                                <img src="./assets/play.svg" alt="">
                            </div>
                        
        
         </li>`;
    }

    Array.from(document.querySelector(".songLists").getElementsByTagName("li")).forEach(function (ele) {
        ele.addEventListener("click", function (element) {
            //console.log(ele.querySelector(".info").firstElementChild.innerHTML);
            playMusic(ele.querySelector(".info").firstElementChild.innerHTML);
        })
    })

    return songs
}

const playMusic = function (track, pause = false) {
    //let audio = new Audio("/songs/" + track)
    currentSong.src = `/${currFolder}/` + track
    if (!pause) {
        currentSong.play();
        play.src = "./assets/pause.svg"
    }

    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = " 00:00 / 00:00"
}

async function displayAlbums() {
    let fetchData = await fetch("http://127.0.0.1:5500/songs/");
    let parsedData = await fetchData.text();
    //console.log(parsedData);
    let div = document.createElement("div");
    div.innerHTML = parsedData;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    //console.log(anchors)
    let array = Array.from(anchors)
    //console.log(array)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs") && e.href.split("/").length === 5) {
            let folder = e.href.split("/").slice(-1)[0];
            // Get the metadata of the folder
            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json();
            cardContainer.innerHTML = cardContainer.innerHTML + ` <div data-folder="${folder}" class="card">
            <div class="play">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                        stroke-linejoin="round" />
                </svg>
            </div>

            <img src="/songs/${folder}/cover.jpg" alt="">
            <h2>${response.title}</h2>
            <p>${response.description}</p>
        </div>`
        }
    }

      // Load the playlist whenever card is clicked
      Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            //console.log("Fetching Songs")
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])

        })
    })

}

async function main() {

    await getSongs("songs/Animal");
    //console.log(songs);

    playMusic(songs[0], true);

    // Display all the albums on the page
    await displayAlbums();



    play.addEventListener("click", function () {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "./assets/pause.svg"
        } else {
            currentSong.pause();
            play.src = "./assets/playbtn.svg"
        }
    })

    currentSong.addEventListener("timeupdate", function () {
        document.querySelector(".songtime").innerHTML = `${formatTime(currentSong.currentTime)}/${formatTime(currentSong.duration)}`;
        document.querySelector(".seekbarCircle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    document.querySelector(".seekbar").addEventListener("click", function (e) {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".seekbarCircle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })

    // var audio = new Audio(songs[0]);
    // audio.play();

    // audio.addEventListener("loadeddata", function() {
    //     let duration = audio.duration;
    //     console.log(audio.duration, audio.currentSrc, audio.currentTime);
    // })

    //Hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    //close button 
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-350px"
    })

    //event listener on previous
    previous.addEventListener("click", () => {
        currentSong.pause()
        //console.log("Previous clicked")
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })

    //event listener on next
    next.addEventListener("click", () => {
        currentSong.pause()
        //console.log("Next clicked")

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })

    //event listener on volume range
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
    })


    // Add event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e=>{ 
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }

    })
}

main();

