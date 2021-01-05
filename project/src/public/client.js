let store = new Immutable.Map({
    rovers: new Immutable.List(['Curiosity', 'Opportunity', 'Spirit']),
    selectedRover: 'Curiosity'
})

const root = document.getElementById('root')

const updateStore = (store, newState) => {
    store = store.mergeDeep(newState);
    render(root, store)
}

const render = async(root, state) => {
    root.innerHTML = App(state, RoverSelector);
    var roverSelector = document.getElementById('rover-select');
    roverSelector.addEventListener('change', function() {
        store = store.set('selectedRover', this.value);
        loadData(store);
    }, false);
}


const loadData = (state) => {
    getRoverData(state.get('selectedRover'));
}

const RoverSelector = (state) => {
    const selectedRover = state.get('selectedRover');
    const optionBuilder = (rover) => {
        return `<option value="${rover}" ${rover===selectedRover ? "selected" : ""} > ${rover} </option>`
    }
    return `
        <select name="rovers" id="rover-select">
        ${state.get('rovers').map(optionBuilder).join('')}
        </select>
    `;

}


const App = (state, roverselector) => {
    const selectedRover = state.get('selectedRover');
    const roverdata = state.get('roverdata');
    const mission = roverdata.get('manifest');
    const photos = roverdata.get('photos');

    return `
        <header></header>
        <main>

        <section>
            <h1>Choose the Rover</h1>
            ${roverselector(state)}
        </section>

        <section>
            <h1>Rover Mission Data</h1>
             ${Mission(mission)}
        </section>

        <section>
            <h1>Recent Photos</h1>
            ${Photos(photos)}
        </section>
           
        </main>
        <footer></footer>
    `
}

window.addEventListener('load', () => {
    loadData(store);
})


const Mission = (mission) => {
    return (`
    <table>
        <tr>
            <td>Launch Date</th>
            <td>${mission.get('launchDate')}</th>
        </tr>
        <tr>
            <td>Landing Date</td>
            <td>${mission.get('landingDate')}</td>
        </tr>
        <tr>
            <td>Status</td>
            <td>${mission.get('state')}</td>
        </tr>
    </table>
    `);
}

const Photos = (photos) => {
    if (!photos) return;
    let photo = photos[0];
    return (`
    <div class=gallery>
    ${photos
        .map(photo =>
          Photo(photo.get('img_src'), photo.get('earth_date'))
        )
        .join('')}
    `);
}

const Photo = (src, date) => {
    return (`
    <div class="imagebox">
        <img src=${src} class="image" >
        <div class="desc">${date}</div>
    </div>
    `);
}


const getRoverData = (selectedRover) => {

    fetch(`http://localhost:3000/rover/` + selectedRover)
        .then(res => res.json())
        .then(roverdata => updateStore(store, { roverdata }));

}