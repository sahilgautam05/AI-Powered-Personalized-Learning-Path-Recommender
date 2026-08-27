from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class LearnerProfile(BaseModel):
    user_id: str = "demo_learner_01"
    name: str = "Demo Learner"
    email: str = "learner@example.com"
    password: Optional[str] = "password123"
    goal: str = "Become a Full Stack Developer"
    experience: str = "Intermediate" # Beginner, Intermediate, Advanced
    existing_skills: Dict[str, int] = Field(default_factory=dict)
    interests: List[str] = Field(default_factory=list)
    weekly_hours: int = 10
    preferred_resource_type: str = "All" # Video, Hands-on Lab, Article, Project
    target_duration: str = "6 Months"
    onboarded: bool = False

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    goal: Optional[str] = "Full Stack Developer"
    experience: Optional[str] = "Intermediate"
    weekly_hours: Optional[int] = 10
    target_duration: Optional[str] = "6 Months"
    existing_skills: Optional[Dict[str, int]] = Field(default_factory=dict)

class GoalAnalysisRequest(BaseModel):
    goal: str
    experience: Optional[str] = "Intermediate"

class SkillGapItem(BaseModel):
    skill_name: str
    current_level: int
    required_level: int
    gap: int
    category: str
    recommended_resource_ids: List[str] = Field(default_factory=list)

class SkillGapResponse(BaseModel):
    goal: str
    skills: List[SkillGapItem]

class ResourceItem(BaseModel):
    id: str
    title: str
    type: str # Course, Hands-on Lab, Video, Article, Project
    description: str
    difficulty: str # Beginner, Intermediate, Advanced
    duration_hours: float
    skills: List[str]
    prerequisites: List[str]
    match_score: int = 0
    why_recommended: str = ""
    url: Optional[str] = "#"

class RecommendationRequest(BaseModel):
    user_id: str = "sahil_01"
    limit: Optional[int] = 5

class PhaseModule(BaseModel):
    id: str
    title: str
    description: str
    status: str # completed, in_progress, upcoming
    estimated_weeks: int
    resources: List[ResourceItem]
    project: Optional[Dict[str, Any]] = None
    assessment_id: Optional[str] = None
    quiz_score: Optional[int] = None

class LearningPathResponse(BaseModel):
    id: str
    user_id: str
    goal: str
    overall_progress: int
    target_duration: str
    current_milestone: str
    phases: List[PhaseModule]

class AssessmentQuestion(BaseModel):
    id: int
    question: str
    options: List[str]
    correct_option: int
    explanation: str
    skill_tag: str

class AssessmentDetail(BaseModel):
    id: str
    title: str
    description: str
    module_id: str
    skill_tag: str
    questions: List[AssessmentQuestion]

class AssessmentSubmit(BaseModel):
    user_id: str = "sahil_01"
    assessment_id: str
    answers: Dict[int, int] # question_id -> selected_option_index

class AssessmentResult(BaseModel):
    assessment_id: str
    score: int
    passed: bool
    strong_areas: List[str]
    weak_areas: List[str]
    recommended_action: str
    next_recommended_module: Optional[str] = None

class FeedbackSubmit(BaseModel):
    user_id: str = "sahil_01"
    resource_id: str
    rating: int # 1 to 5
    comment: Optional[str] = ""

class ChatRequest(BaseModel):
    user_id: str = "sahil_01"
    message: str
    context: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    reply: str
    suggested_followups: List[str] = Field(default_factory=list)

class NotificationItem(BaseModel):
    id: str
    title: str
    message: str
    time: str
    type: str = "recommendation"
    read: bool = False
    target_tab: str = "dashboard"
