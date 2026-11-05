import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Code, Calendar, ArrowRight } from 'lucide-react';
import StatusBadge from './StatusBadge';

const ProjectCard = ({ project }) => {
  const teamCount = (project.members?.length || 0) + 1;
  const isFull = teamCount >= (project.maxTeamSize || 4);

  return (
    <div className="bg-white border border-subtle rounded-xl p-5 hover:border-slate-300 transition-all duration-150 flex flex-col justify-between shadow-xs hover:shadow-card group">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <span className="inline-block px-2.5 py-0.5 text-xs font-medium rounded-md bg-slate-100 text-slate-700">
            {project.category}
          </span>
          <StatusBadge status={project.status} size="xs" />
        </div>

        <Link to={`/projects/${project._id}`} className="block">
          <h3 className="text-base font-semibold text-charcoal group-hover:text-navy transition-colors line-clamp-1 mb-2">
            {project.title}
          </h3>
        </Link>

        <p className="text-sm text-charcoal-light line-clamp-2 mb-4 leading-relaxed">
          {project.description}
        </p>

        {/* Technologies chips */}
        {project.technologies && project.technologies.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {project.technologies.slice(0, 3).map((tech, idx) => (
              <span
                key={idx}
                className="inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded bg-slate-50 text-slate-600 border border-slate-200"
              >
                {tech}
              </span>
            ))}
            {project.technologies.length > 3 && (
              <span className="text-[11px] font-medium text-slate-400 self-center">
                +{project.technologies.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-subtle flex items-center justify-between mt-auto">
        {/* Creator Info */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-slate-200 text-charcoal flex items-center justify-center text-xs font-semibold">
            {project.owner?.name?.charAt(0) || 'U'}
          </div>
          <div className="text-xs">
            <p className="font-medium text-charcoal truncate max-w-[110px]">
              {project.owner?.name || 'Student'}
            </p>
            <p className="text-[11px] text-slate-400 truncate max-w-[110px]">
              {project.owner?.department?.split(' ')[0] || 'Engineering'}
            </p>
          </div>
        </div>

        {/* Team size & action */}
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center text-xs font-medium ${
              isFull ? 'text-amber-600' : 'text-slate-500'
            }`}
            title={`Team members: ${teamCount}/${project.maxTeamSize}`}
          >
            <Users className="w-3.5 h-3.5 mr-1" />
            <span>
              {teamCount}/{project.maxTeamSize}
            </span>
          </div>

          <Link
            to={`/projects/${project._id}`}
            className="p-1.5 rounded-lg text-slate-400 hover:text-navy hover:bg-slate-100 transition-colors"
            title="View Details"
          >
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
