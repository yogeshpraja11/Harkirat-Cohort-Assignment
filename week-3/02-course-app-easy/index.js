const express = require('express');
const app = express();

app.use(express.json());

let ADMINS = [];
let USERS = [];
let COURSES = [];

const adminAuthentication = (req, res, next) => {
  const { username, password } = req.headers;

  const admin = ADMINS.find(a => a.username === username && a.password === password);
  if (admin) {
    next();
  } else {
    res.status(403).json({ message: 'Admin authentication failed' });
  }
};

const userAuthentication = (req, res, next) => {
  const { username, password } = req.headers;
  const user = USERS.find(u => u.username === username && u.password === password);
  if (user) {
    req.user = user;  // Add user object to the request
    next();
  } else {
    res.status(403).json({ message: 'User authentication failed' });
  }
};

// Admin routes
app.post('/admin/signup', (req, res) => {
  const admin=req.body;
  const existingAdmin=ADMINS.find(a=>a.username==admin.username)
  if(existingAdmin){
    res.status(403).json({message:'Admin already exists'});
  }
  else{
    ADMINS.push(existingAdmin);
    res.json({message:'User created sucessfully'})
  }
});

app.post('/admin/login',adminAuthentication, (req, res) => {
    res.json({message:'Loged in sucessfully'})

});

app.post('/admin/courses',adminAuthentication, (req, res) => {
  const course=req.body;
  course.id= Date.now();
  COURSES.push(course);
  res.json({message:'Course added sucessfully'})
});

app.put('/admin/courses/:courseId',adminAuthentication, (req, res) => {
  const courseId=parseInt(req.params.courseId);
  const course=COURSES.find(c=>c.id===courseId)
  if(coures){
    Object.assign(course, req.body);
    res.json({message:'Course updated sucessfully'})
  }
  else{
    res.status(403).json({message:'Couldnt update course'})
  }
});

app.get('/admin/courses',adminAuthentication, (req, res) => {
  res.json({courses:COURSES});
});

// User routes
app.post('/users/signup', (req, res) => {
  const user = {
    username: req.body.username,
    password: req.body.password,
    purchasedCourses: []
  }
  USERS.push(user);
  res.json({ message: 'User created successfully' });
});

app.post('/users/login',userAuthentication, (req, res) => {
  res.json({ message: 'Logged in successfully' });
});

app.get('/users/courses',userAuthentication, (req, res) => {
  let filteredCourese=[];
  for(const i=0;i<COURSES.length;i++){
    if(COURSES[i].filtered){
      filteredCourese.push(COURSES[i]);
    }
  }
  res.json({courses:filteredCourese});
});

app.post('/users/courses/:courseId', (req, res) => {
  const courseId=Number(req.params.courseId);
  const course=COURSES.find(c=>c.id==courseId&&c.published);
  if(course){
    req.user.purchasedCourses.push(courseId);
    res.json({message:'Course Added Sucessfully'});
  }
  else{
    res.status(403).json({message:'Could not add course'})
  }
});

app.get('/users/purchasedCourses', (req, res) => {
  var purchasedCourseIds = req.user.purchasedCourses; 
  var purchasedCourses = [];
  for (let i = 0; i<COURSES.length; i++) {
    if (purchasedCourseIds.indexOf(COURSES[i].id) !== -1) {
      purchasedCourses.push(COURSES[i]);
    }
  }

  res.json({ purchasedCourses });
});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
