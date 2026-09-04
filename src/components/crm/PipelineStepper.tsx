import {
  Check,
  Clock,
  XCircle,
  Trophy,
  Send,
  Sparkles,
} from 'lucide-react';
import type { ClientRow } from '@/lib/crm';

type StepStatus = 'completed' | 'current' | 'upcoming' | 'rejected';

export function PipelineStepper({ client }: { client: ClientRow }) {
  const isResearcherCurrent = client.status === 'RESEARCH';

  const isVerifierRejected = client.status === 'VERIFIER_REJECTED';
  const isVerifierDone = Boolean(client.verifiedAt) && !isVerifierRejected;
  const isVerifierCurrent = client.status === 'RAW';

  const isSdrRejected = ['SDR_REJECTED', 'NOT_QUALIFIED'].includes(client.status);
  const isSdrDone = Boolean(client.qualifiedAt) || ['QUALIFIED', 'DISCOVERY', 'OFFER', 'NEGOTIATION', 'PAYMENT_PENDING', 'WON'].includes(client.status);
  const isSdrCurrent = ['VERIFIED', 'SDR_VALIDATED', 'CONTACTED', 'REPLIED', 'INTERESTED'].includes(client.status);

  const isCloserWon = client.status === 'WON';
  const isCloserLost = client.status === 'LOST';
  const isCloserCurrent = ['QUALIFIED', 'DISCOVERY', 'OFFER', 'NEGOTIATION', 'PAYMENT_PENDING'].includes(client.status);

  const step1State: StepStatus = isResearcherCurrent ? 'current' : 'completed';
  const step2State: StepStatus = isVerifierRejected ? 'rejected' : isVerifierDone ? 'completed' : isVerifierCurrent ? 'current' : 'upcoming';
  const step3State: StepStatus = isSdrRejected ? 'rejected' : isSdrDone ? 'completed' : isSdrCurrent ? 'current' : 'upcoming';
  const step4State: StepStatus = isCloserWon ? 'completed' : isCloserLost ? 'rejected' : isCloserCurrent ? 'current' : 'upcoming';

  const steps = [
    {
      num: 1,
      name: 'Researcher',
      desc: 'Поиск и сбор данных',
      actor: client.researcherName,
      rate: `${client.researcherCommissionRate}%`,
      state: step1State,
      tag: isResearcherCurrent ? 'В работе' : 'Готово',
      icon: isResearcherCurrent ? <Clock size={14} /> : <Check size={14} />,
    },
    {
      num: 2,
      name: 'Verifier',
      desc: 'Проверка гипотезы',
      actor: client.verifierOwnerName || client.verifiedByName || 'Ожидает верификации',
      rate: `${client.verifierCommissionRate}%`,
      state: step2State,
      tag: isVerifierRejected ? 'Отклонён' : isVerifierDone ? 'Подтверждён' : isVerifierCurrent ? 'На проверке' : 'Ожидает',
      icon: isVerifierDone ? <Check size={14} /> : isVerifierRejected ? <XCircle size={14} /> : isVerifierCurrent ? <Clock size={14} /> : '2',
    },
    {
      num: 3,
      name: 'SDR',
      desc: 'Контакт и квалификация',
      actor: client.sdrOwnerName || 'Ожидает назначения',
      rate: `${client.sdrCommissionRate}%`,
      state: step3State,
      tag: isSdrRejected ? 'Отклонён' : isSdrDone ? 'Квалифицирован' : isSdrCurrent ? (client.status === 'VERIFIED' ? 'Приёмка' : client.status === 'CONTACTED' ? 'Связались' : client.status === 'REPLIED' ? 'Ответил' : client.status === 'INTERESTED' ? 'Интерес' : 'В работе') : 'Ожидает',
      icon: isSdrDone ? <Check size={14} /> : isSdrRejected ? <XCircle size={14} /> : isSdrCurrent ? <Send size={14} /> : '3',
    },
    {
      num: 4,
      name: 'Closer',
      desc: 'Discovery, оффер и оплата',
      actor: client.closerOwnerName || 'Ожидает назначения',
      rate: `${client.closerCommissionRate}%`,
      state: step4State,
      tag: isCloserWon ? 'Оплачено' : isCloserLost ? 'Проигран' : isCloserCurrent ? (client.status === 'QUALIFIED' ? 'Приёмка' : client.status === 'DISCOVERY' ? 'Discovery' : client.status === 'OFFER' ? 'Оффер' : client.status === 'PAYMENT_PENDING' ? 'Оплата' : 'Переговоры') : 'Ожидает',
      icon: isCloserWon ? <Trophy size={14} /> : isCloserLost ? <XCircle size={14} /> : isCloserCurrent ? <Sparkles size={14} /> : '4',
    },
  ];

  return (
    <div className="crm-pipeline-stepper">
      {steps.map((s) => (
        <div key={s.num} className={`crm-step-card ${s.state}`}>
          <div className="crm-step-badge-icon">{s.icon}</div>
          <div className="crm-step-content">
            <div className="crm-step-title">{s.name}</div>
            <div className="crm-step-actor" title={s.actor}>{s.actor}</div>
            <span className="crm-step-status-tag">{s.tag}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
