import sys
import os
import bcrypt

# Ensure Python can find the 'app' folder
sys.path.append(os.getcwd())

from app.database import SessionLocal
from app.models.user import User
from app.models.student import Student
from app.models.cv import CV # Matches your cv.py filename

def seed_talentia():
    db = SessionLocal()
    try:
        # 1. Ensure User exists
        test_user = db.query(User).filter(User.email == "test@talentia.tn").first()
        if not test_user:
            hashed_pw = bcrypt.hashpw("password123".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            test_user = User(
                email="test@talentia.tn", 
                password=hashed_pw, 
                role="student"
            )
            db.add(test_user)
            db.flush() 
            print("✅ User account ready.")
        
        # 2. Ensure Student exists (Linked to User)
        test_student = db.query(Student).filter(Student.id == 1).first()
        if not test_student:
            test_student = Student(
                id=1,
                user_id=test_user.id,
                first_name="Mayssam",
                last_name="Slimani",
                university="UVT"
            )
            db.add(test_student)
            db.flush()
            print("✅ Student profile ready.")

        # 3. Create the CV record using your specific schema
        existing_cv = db.query(CV).filter(CV.student_id == 1).first()
        if not existing_cv:
            new_cv = CV(
                student_id=1,
                title="Software Engineer Resume",
                language="English",
                file_url="uploads/test_cv.pdf",
                file_name="test_cv.pdf"
            )
            db.add(new_cv)
            print("✅ CV record created for Student 1.")
        else:
            print("ℹ️ Student 1 already has a CV.")

        db.commit()
        print("\n🚀 Database seeding complete! Refresh your browser.")

    except Exception as e:
        db.rollback()
        print(f"❌ Error during seeding: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_talentia()