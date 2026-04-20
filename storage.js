// NORES: 
//   storage.js is the BugTrackers data layer

//   it handles all reading and writing to localStorage

//   Keys used:
//     bt_people : array of person objects
//     bt_projects :array of project objects
//     bt_bugs : array of bug/issue objects  (which will be created bby Person 2)

//   has to be included on every page with the below:
//     <script src="storage.js"></script>



//INTERNAL HELPERS (these are just like helper funcs used everywhere else)
  //think of it as behind the scenes.
  // One function loads saved data from the browser then another saves data back into the browse and another creates unique IDs so every person,
  // project, or bug are uniwque and can be told apart. Think of them like basic tools: one that reads, one that writes and one labels things

function _getList(key) {
  var raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : [];
}

function _saveList(key, list) {
  localStorage.setItem(key, JSON.stringify(list));
}

//Unique ID: eg) "person_17153241000_a3f2c" 
function _makeId(prefix) {
  return prefix + '_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
}



  //  PEOPLE
  //  Fields: id, name, surname, email, username
 //this will manage all peeps in our system. Its going to allow the website to store a list of users, find a specific person, add a new person, 
 // and remove someone if needed. When a new person is ceeated then the system makes sure their username is unique si tgat no 2 people can have the same one
 //layman terms, this sections like a contact list where you add search delete

function getAllPeople() {
  return _getList('bt_people');
}

function findPerson(id) {
  var list = getAllPeople();
  for (var i = 0; i < list.length; i++) {
    if (list[i].id === id) return list[i];
  }
  return null;
}


  // createPerson(name, surname, email, username)
  // will throws an Error if the username is already taken.


function createPerson(name, surname, email, username) {
  var list = getAllPeople();
  var clean = username.trim().toLowerCase();

  for (var i = 0; i < list.length; i++) {
    if (list[i].username === clean) {
      throw new Error('Username "' + username + '" is taken — please choose another.');
    }
  }

  var person = {
    id:       _makeId('person'),
    name:     name.trim(),
    surname:  surname.trim(),
    email:    email.trim().toLowerCase(),
    username: clean
  };

  list.push(person);
  _saveList('bt_people', list);
  return person;
}

function deletePerson(id) {
  var list = getAllPeople().filter(function(p) { return p.id !== id; });
  _saveList('bt_people', list);
}



  //  PROJECTS
  //  Fields: id, name
    //it works like the people section but for projects instead. each proj just has a name and an ID. Think of it like a list of tasks or folders that your team works on


function getAllProjects() {
  return _getList('bt_projects');
}

function findProject(id) {
  var list = getAllProjects();
  for (var i = 0; i < list.length; i++) {
    if (list[i].id === id) return list[i];
  }
  return null;
}

function createProject(name) {
  var list = getAllProjects();
  var project = { id: _makeId('project'), name: name.trim() };
  list.push(project);
  _saveList('bt_projects', list);
  return project;
}

function deleteProject(id) {
  var list = getAllProjects().filter(function(p) { return p.id !== id; });
  _saveList('bt_projects', list);
}


// BUGS / ISSUES ( Person 2)
//this part can track za bugs in projects. It should allow you to create a bug report, view all bugs, update details on it or delete it
//each bug has more info than people or projects, like a description or who found it or who its assigned to, its priorty and if it is solved or not (so its the issue tracker)


function getAllBugs() {
  return _getList('bt_bugs');
}

function findBug(id) {
  var list = getAllBugs();
  for (var i = 0; i < list.length; i++) {
    if (list[i].id === id) return list[i];
  }
  return null;
}

function createBug(data) {
  var list = getAllBugs();
  var today = new Date().toISOString().split('T')[0];
  var bug = {
    id:                   _makeId('bug'),
    summary:              data.summary              || '',
    description:          data.description          || '',
    identifiedBy:         data.identifiedBy         || null,
    dateIdentified:       data.dateIdentified        || today,
    projectId:            data.projectId            || null,
    assignedTo:           data.assignedTo           || null,
    status:               data.status               || 'open',
    priority:             data.priority             || 'medium',
    targetResolutionDate: data.targetResolutionDate || null,
    actualResolutionDate: data.actualResolutionDate || null,
    resolutionSummary:    data.resolutionSummary    || ''
  };
  list.push(bug);
  _saveList('bt_bugs', list);
  return bug;
}

function updateBug(id, changes) {
  var list = getAllBugs();
  for (var i = 0; i < list.length; i++) {
    if (list[i].id === id) {
      for (var key in changes) list[i][key] = changes[key];
      _saveList('bt_bugs', list);
      return list[i];
    }
  }
  throw new Error('Bug not found: ' + id);
}

function deleteBug(id) {
  _saveList('bt_bugs', getAllBugs().filter(function(b) { return b.id !== id; }));
}


  //  SEED DATA
  // now what this does is it runs once on first load.
  // it will pre-populates 5 people and 4 projects so
  // soo the app is not empty at first launch.

  //this just is to make sure the website doesnt start empty. it runs once and not again

var SEED_VERSION = '4';

function _seed() {
  if (localStorage.getItem('bt_seeded') === SEED_VERSION) return;

  // Always overwrite seed people (removes stale names from old seed runs)
  var seedPeople = [
    { id: 'person_seed_1', name: 'Saiesha',  surname: 'Naidoo',    email: 'sai@gmail.com',  username: 'sai_n'  },
    { id: 'person_seed_2', name: 'Letago',   surname: 'Makhubele', email: 'let@gmail.com',  username: 'let_m'  },
    { id: 'person_seed_3', name: 'Phemelo',  surname: 'Segai',     email: 'pem@gmail.com',  username: 'pem_s'  },
    { id: 'person_seed_4', name: 'Mongezi',  surname: 'Mahlangu',  email: 'mon@gmail.com',  username: 'mah_m'  },
    { id: 'person_seed_5', name: 'Michael',  surname: 'Jackson',   email: 'mic@gmail.com',  username: 'mic_j'  }
  ];

  // Keep any people the user added manually, replace/add the seed ones
  var existing = getAllPeople().filter(function(p) {
    return p.id.indexOf('person_seed_') === -1;
  });
  _saveList('bt_people', seedPeople.concat(existing));

  // Only write seed projects if none exist yet
  if (getAllProjects().length === 0) {
    _saveList('bt_projects', [
      { id: 'project_seed_1', name: 'Portfolio Website'               },
      { id: 'project_seed_2', name: 'Bug Tracker Website'             },
      { id: 'project_seed_3', name: 'E-commerce Platform'             },
      { id: 'project_seed_4', name: 'Online Learning Management System' }
    ]);
  }

  if (getAllBugs().length === 0) _saveList('bt_bugs', []);

  localStorage.setItem('bt_seeded', SEED_VERSION);
}

_seed(); //needed for seed func to run
