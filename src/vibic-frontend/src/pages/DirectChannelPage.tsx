import { useParams } from 'react-router-dom';
import AppShell from '../layout/AppShell';

export default function ChannelPage() {
  const { id } = useParams();

  return <AppShell id={id}/>;
}