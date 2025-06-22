import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Login } from '../pages/Login';
import { Home } from '../pages/Home';
import { NewAssessment } from '../pages/NewAssessment';
import { FrameworkManagement } from '../pages/FrameworkManagement';
import { Assessments } from '../pages/Assessments';
import { AssessmentView } from '../pages/AssessmentView';
import { EditAssessment } from '../pages/EditAssessment';
import { FAQ } from '../pages/FAQ';
import { AdminPanel } from '../pages/AdminPanel';
import { ProcessDetails } from '../pages/ProcessDetails';
import { ProcessEditor } from '../pages/ProcessEditor';
import { useUser } from '../contexts/UserContext';

export function AppRoutes() {
  const { isSuperAdmin } = useUser();

  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="new-assessment" element={<NewAssessment />} />
        <Route path="framework" element={<FrameworkManagement />} />
        <Route path="framework/processes/:processIds" element={<ProcessDetails />} />
        <Route path="assessments/:assessmentId/processes/:processIds" element={<ProcessDetails />} />
        <Route path="process-editor/:processId" element={<ProcessEditor />} />
        <Route path="assessments" element={<Assessments />} />
        <Route path="assessments/:id" element={<AssessmentView />} />
        <Route path="edit-assessment/:assessmentId/category/:categoryId" element={<EditAssessment />} />
        <Route path="faq" element={<FAQ />} />
        <Route path="admin" element={isSuperAdmin ? <AdminPanel /> : <Home />} />
      </Route>
    </Routes>
  );
}