export function Footer() {
  return (
    <footer className="w-full mt-auto py-12 px-margin-mobile md:px-margin-desktop grid grid-cols-1 md:grid-cols-4 gap-gutter bg-surface-container-lowest border-t border-outline-variant/30">
      <div className="md:col-span-1">
        <h6 className="font-headline-sm text-headline-md text-primary font-black tracking-tight mb-2">DR GESTOR MZ</h6>
        <p className="font-body-md text-body-md text-secondary mt-4 leading-relaxed">
          © 2024 DR GESTOR MZ. Todos os direitos reservados. Líder no panorama empresarial Moçambicano.
        </p>
      </div>
      <div className="space-y-4">
        <div className="font-label-md text-label-md text-on-surface font-bold uppercase">Empresa</div>
        <ul className="space-y-2">
          <li><a className="text-body-md text-secondary hover:underline hover:text-primary transition-all" href="#">Política de Privacidade</a></li>
          <li><a className="text-body-md text-secondary hover:underline hover:text-primary transition-all" href="#">Termos de Serviço</a></li>
        </ul>
      </div>
      <div className="space-y-4">
        <div className="font-label-md text-label-md text-on-surface font-bold uppercase">Suporte</div>
        <ul className="space-y-2">
          <li><a className="text-body-md text-secondary hover:underline hover:text-primary transition-all" href="#">Contactar o Suporte</a></li>
          <li><a className="text-body-md text-secondary hover:underline hover:text-primary transition-all" href="#">Base de Conhecimento</a></li>
        </ul>
      </div>
      <div className="space-y-4">
        <div className="font-label-md text-label-md text-on-surface font-bold uppercase">Localização</div>
        <p className="text-body-md text-secondary">
          Sede Moçambique<br/>
          Av. Kenneth Kaunda, 1200<br/>
          Maputo, MZ
        </p>
      </div>
    </footer>
  );
}
