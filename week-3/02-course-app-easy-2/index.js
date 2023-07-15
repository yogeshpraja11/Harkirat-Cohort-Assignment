const express = require('express');
const token=require('jsonwebtoken');
const app = express();

app.use(express.json());

let ADMINS = [];
let USERS = [];
let COURSES = [];

const seceretKey='sup3r@se3';

const generateJWT=(user)=>{
  const payload={username:user.username,}
  return( jwt.sign(payload,seceretKey,{expiresIn:'1h'})
  )};

  const authenticateJWT=(req,res,next)=>{
    const authHeader=req.headers.authorization;

    if(authHeader){
      const token=authHeader.split(' ')[1];
      jwt.verify(token,seceretKey,(err,user)=>{
        if(err){
         return res.sendStaus(403);
        }
        req.user=user;
        next();
      })
    }
    else{
      res.sendStaus(401);
    }
  };

// Admin routes
app.post('/admin/signup', (req, res) => {
   const admin=req.body;
   const existingAdmin=ADMINS.find(a=>a.username==admin.username);
   if(existingAdmin){
    res.status(403).json({message:'Admin already exists'})
   }
   else{ 
    ADMINS.push(admin);
    const token= generateJWT(admin);
    res.json({message:'Admin created sucessfully',token});  
}
});

app.post('/admin/login', (req, res) => {
  const { username, password } = req.headers;
  const admin = ADMINS.find(a => a.username === username && a.password === password);

  if (admin) {
    const token = generateJwt(admin);
    res.json({ message: 'Logged in successfully', token });
  } else {
    res.status(403).json({ message: 'Admin authentication failed' });
  }
});

app.post('/admin/courses',authenticateJWT, (req, res) => {
  const course=req.body;
  courseId=COURSES.length+1;
  COURSES.push(course);
  res.json({message:'course added sucessfully',courseId:course.id});
});

app.put('/admin/courses/:courseId', authenticateJWT, (req, res) => {
  coureseId=parseInt(req.params.courseId);
  const courseIndex=COURSES.findIndex(c=>c.id===courseId);

  if(courseIndex>-1){
    const updatedCourse={...COURSES[courseIndex],...req.body};
    COURSES[courseIndex]=updatedCourse;
    res.json({message:'Course updated sucessfully'})
  }
  else{
    res.status(404).json({message:'Course not found'})
  }
});

app.get('/admin/courses',authenticateJWT, (req, res) => {
  res.json({ courses: COURSES });
});

// User routes
app.post('/users/signup', (req, res) => {
  const user = req.body;
  const existingUser = USERS.find(u => u.username === user.username);
  if (existingUser) {
    res.status(403).json({ message: 'User already exists' });
  } else {
    USERS.push(user);
    const token = generateJwt(user);
    res.json({ message: 'User created successfully', token });
  }
});

app.post('/users/login', (req, res) => {
  const { username, password } = req.headers;
  const user = USERS.find(u => u.username === username && u.password === password);
  if (user) {
    const token = generateJwt(user);
    res.json({ message: 'Logged in successfully', token });
  } else {
    res.status(403).json({ message: 'User authentication failed' });
  }
});

app.get('/users/courses',authenticateJWT, (req, res) => {
  res.json({ courses: COURSES });
});

app.post('/users/courses/:courseId', (req, res) => {
   const courseId=parseInt(req.params.courseId);
   const course=COURSES.find(c=>c.id===courseId);
   if(course){
    const user=USERS.find(u=>u.username=req.body.username);
    if(user){
      if(!user.purchasedCourses){
        user.purchasedCourses=[];
      }
      user.purchasedCourses.push(course);
      res.json({message:'Course Purchased'})
    }else {
      res.status(403).json({ message: 'User not found' });
    }
   }else {
    res.status(404).json({ message: 'Course not found' });
  }
  
});

app.get('/users/purchasedCourses', authenticateJWT,(req, res) => {
  const user = USERS.find(u => u.username === req.user.username);
  if (user && user.purchasedCourses) {
    res.json({ purchasedCourses: user.purchasedCourses });
  } else {
    res.status(404).json({ message: 'No courses purchased' });
  }
});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
