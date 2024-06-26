function openModal() {
    document.getElementById('myModal').style.display = 'block';
    document.querySelector('.content-container').classList.add('blur');
}

function closeModal() {
    document.getElementById('myModal').style.display = 'none';
    document.querySelector('.content-container').classList.remove('blur');
}

function addExercise(exercise) {
    const cardsContainer = document.querySelector('.cards');

    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
        <h3>${exercise}</h3>
        <div class="sets-container"></div>
        <button onclick="addSet(this)">Add Set</button>
    `;

    cardsContainer.appendChild(card);

    closeModal();
}

function addSet(button) {
    const setsContainer = button.previousElementSibling;
    const sets = setsContainer.getElementsByClassName('set');

    const setDiv = document.createElement('div');
    setDiv.className = 'set';
    setDiv.innerHTML = `
        <div class="coolinput">
            ${sets.length === 0 ? '<label for="weight" class="text">Weight:</label>' : ''}
            <input type="number" placeholder="Weight" name="weight" class="input">
        </div>
        <div class="coolinput">
            ${sets.length === 0 ? '<label for="reps" class="text">Reps:</label>' : ''}
            <input type="number" placeholder="Reps" name="reps" class="input">
        </div>
    `;
    setsContainer.appendChild(setDiv);
}

function exportData() {
    const cards = document.querySelectorAll('.card');
    let data = 'Lift Log Data:\n\n';

    cards.forEach((card) => {
        data += `${card.querySelector('h3').textContent}:\n`;
        const sets = card.querySelectorAll('.set');
        sets.forEach((set, setIndex) => {
            const weight = set.querySelector('input[name="weight"]').value;
            const reps = set.querySelector('input[name="reps"]').value;

            if (weight === '' || reps === '') {
                alert('All sets must have both weight and reps filled out to export.');
                return;
            }

            data += `  Set ${setIndex + 1}: Weight = ${weight}, Reps = ${reps}\n`;
        });
        data += '\n';
    });

    const blob = new Blob([data], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lift_log.txt';
    a.click();
    URL.revokeObjectURL(url);
}