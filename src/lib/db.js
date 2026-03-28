// Simple IndexedDB Wrapper to handle mock backend

const DB_NAME = 'padhai_db';
const DB_VERSION = 2;

export const getDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('users')) {
        db.createObjectStore('users', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('courses')) {
        db.createObjectStore('courses', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('enrollments')) {
        db.createObjectStore('enrollments', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('otpRequests')) {
        db.createObjectStore('otpRequests', { keyPath: 'id' });
      }
    };
  });
};

const normalizeCourse = (course) => {
  if (!course) return course;
  // If it already has the new structure (modules without lessons) and no chapters, return as is
  if (!course.chapters && course.modules && course.modules.every(m => !m.lessons)) {
    return course;
  }
  
  let newModules = [];
  
  if (course.modules && course.modules.length > 0 && course.modules[0].lessons !== undefined) {
    // Old format with nested lessons inside modules
    course.modules.forEach(m => {
      if (m.lessons && m.lessons.length > 0) {
        m.lessons.forEach(l => {
          newModules.push({
            id: l.id,
            title: `${m.title} - ${l.title}`,
            description: l.description || '',
            videoUrl: l.videoUrl || '',
            videoFile: l.videoFile || null,
            pdfFile: l.pdfFile || null,
            pdfData: l.pdfData || null
          });
        });
      } else {
         newModules.push({
            id: m.id,
            title: m.title,
            description: '',
            videoUrl: '',
            videoFile: null,
            pdfFile: null,
            pdfData: null
          });
      }
    });
  } else if (course.chapters && course.chapters.length > 0) {
    // Legacy mapping of chapters directly to modules
    course.chapters.forEach(c => {
       newModules.push({
         id: c.id,
         title: c.title,
         description: c.textContent || '',
         videoUrl: '', 
         videoFile: c.videoFile || null,
         pdfFile: null,
         pdfData: c.pdfData || null
       });
    });
  } else if (course.modules) {
    newModules = course.modules;
  }

  return {
    ...course,
    chapters: undefined,
    modules: newModules
  };
};

export const dbService = {
  async getAll(storeName) {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.getAll();
      req.onsuccess = () => {
        let result = req.result || [];
        if (storeName === 'courses') {
          result = result.map(normalizeCourse);
        }
        resolve(result);
      };
      req.onerror = () => reject(req.error);
    });
  },
  
  async getById(storeName, id) {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.get(id);
      req.onsuccess = () => {
        let result = req.result;
        if (storeName === 'courses' && result) {
          result = normalizeCourse(result);
        }
        resolve(result);
      };
      req.onerror = () => reject(req.error);
    });
  },

  async put(storeName, item) {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      tx.objectStore(storeName).put(item);
      tx.oncomplete = () => resolve(item);
      tx.onerror = () => reject(tx.error);
    });
  },

  async delete(storeName, id) {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      tx.objectStore(storeName).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },

  // Custom Queries
  async findUserByEmail(email) {
    const users = await this.getAll('users');
    return users.find(u => u.email === email);
  },

  async findCoursesByDeveloper(developerId) {
    const courses = await this.getAll('courses');
    return courses.filter(c => c.developerId === developerId).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async findEnrollmentsByLearner(learnerId) {
    const enrollments = await this.getAll('enrollments');
    return enrollments.filter(e => e.learnerId === learnerId);
  }
};
