/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { Spin, Input, Select } from 'antd';
import { getProjetos } from '../../../services/projetos';
import { getUsuarios } from '../../../services/usuarios';
import ProjetoCarouselCard from './ProjetoCarouselCard';
import ProjetoDetailModal from '../../projetos/ProjetoDetailModal';
import type { Projeto } from '../../../types/projeto';
import type { Usuario } from '../../../types/usuario';


const ProjetosWidget: React.FC = () => {
		const [projetos, setProjetos] = useState<Projeto[]>([]);
		const [usuarios, setUsuarios] = useState<Usuario[]>([]);
		const [loading, setLoading] = useState(true);
		const [selectedProjeto, setSelectedProjeto] = useState<Projeto | null>(null);
		const carouselRef = useRef<HTMLDivElement>(null);
		const [canScrollLeft, setCanScrollLeft] = useState(false);
		const [canScrollRight, setCanScrollRight] = useState(false);
		const [cardWidth, setCardWidth] = useState(180); // Estado para a largura dinâmica do card
		// Filtros
		const [nome, setNome] = useState('');
		const [status, setStatus] = useState('');
		const [categoria, setCategoria] = useState('');
		const [prioridade, setPrioridade] = useState('');

		useEffect(() => {
			async function fetchData() {
					setLoading(true);
					try {
							const [{ projetos: allProjetos }, allUsuarios] = await Promise.all([
									getProjetos(),
									getUsuarios(),
							]);
							setUsuarios(allUsuarios);
							const userId = Number(localStorage.getItem('user_id'));
							
							console.log("Original Projects:", allProjetos);
							console.log("Filtering for user ID:", userId);

							const filtered = allProjetos.filter(p =>
									p.responsavel_id === userId ||
									(p.anexados && p.anexados.some(anexado => anexado.id === userId))
							);
							
							console.log("Filtered Projects:", filtered);
							setProjetos(filtered);

					} finally {
							setLoading(false);
					}
			}
			fetchData();
	}, []);

		// Calcula o tamanho do card com base no tamanho do container
		useLayoutEffect(() => {
			function updateCardSize() {
				if (carouselRef.current) {
					const containerWidth = carouselRef.current.offsetWidth;
					// Tenta exibir aprox. 4.5 cards para indicar que há mais para rolar
					const desiredVisibleCards = 4.5;
					const newCardWidth = Math.max(160, containerWidth / desiredVisibleCards); // Define uma largura mínima
					setCardWidth(newCardWidth);
				}
			}
			window.addEventListener('resize', updateCardSize);
			updateCardSize(); // Cálculo inicial
			return () => window.removeEventListener('resize', updateCardSize);
		}, [projetos]);

		// Opções de filtro
		const statusOptions = [
			{ value: '', label: 'Todos' },
			{ value: 'EA', label: 'Em Andamento' },
			{ value: 'NI', label: 'Não Iniciado' },
			{ value: 'C', label: 'Concluído' },
			{ value: 'P', label: 'Pausado' },
		];
		const categoriaOptions = [
			{ value: '', label: 'Todas' },
			{ value: 'DV', label: 'Desenvolvimento' },
			{ value: 'MK', label: 'Marketing' },
			{ value: 'OT', label: 'Outros' },
		];
		const prioridadeOptions = [
			{ value: '', label: 'Todas' },
			{ value: 'UT', label: 'Urgente' },
			{ value: 'AL', label: 'Alta' },
			{ value: 'MD', label: 'Média' },
			{ value: 'BA', label: 'Baixa' },
		];

			// Aplica filtros
			const projetosFiltrados = projetos.filter(p =>
				(nome === '' || p.nome.toLowerCase().includes(nome.toLowerCase())) &&
				(status === '' || p.status === status) &&
				(categoria === '' || p.categoria === categoria) &&
				(prioridade === '' || p.prioridade === prioridade)
			);

			// Atualiza estado dos botões de scroll
			function updateScrollButtons() {
				const el = carouselRef.current;
				if (!el) return;
				setCanScrollLeft(el.scrollLeft > 0);
				setCanScrollRight(el.scrollLeft + el.offsetWidth < el.scrollWidth - 2);
			}
			useEffect(() => {
				updateScrollButtons();
				const el = carouselRef.current;
				if (!el) return;
				el.addEventListener('scroll', updateScrollButtons);
				window.addEventListener('resize', updateScrollButtons);
				return () => {
					if (el) {
						el.removeEventListener('scroll', updateScrollButtons);
					}
					window.removeEventListener('resize', updateScrollButtons);
				};
			}, [projetosFiltrados.length, cardWidth]);

		return (
			<div className="w-full h-full overflow-hidden p-2 flex flex-col">
				<div className="flex flex-row gap-2 mb-2 items-center flex-shrink-0">
					<Input
						size="small"
						placeholder="Nome do projeto"
						value={nome}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNome(e.target.value)}
						className="w-[90px] md:w-[120px]"
					/>
					<Select
						size="small"
						value={status}
						onChange={setStatus}
						options={statusOptions}
						className="w-[90px] md:w-[120px]"
					/>
					<Select
						size="small"
						value={categoria}
						onChange={setCategoria}
						options={categoriaOptions}
						className="w-[90px] md:w-[120px]"
					/>
					<Select
						size="small"
						value={prioridade}
						onChange={setPrioridade}
						options={prioridadeOptions}
						className="w-[90px] md:w-[120px]"
					/>
				</div>
								{loading ? <Spin /> : (
								<div className="relative w-full flex-1 flex items-center overflow-hidden min-h-0">
										<button
											type="button"
											className="absolute left-1 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-blue-100 border border-gray-300 rounded-full p-1 shadow transition disabled:opacity-30"
											style={{ display: projetosFiltrados.length > 0 ? 'flex' : 'none', alignItems: 'center', justifyContent: 'center' }}
											onClick={() => {
												const el = carouselRef.current;
												if (el) el.scrollBy({ left: -cardWidth, behavior: 'smooth' });
											}}
											onMouseDown={() => {
												const el = carouselRef.current;
												if (!el) return;
												const interval = setInterval(() => {
													el.scrollBy({ left: -30, behavior: 'auto' });
												}, 16);
												(window as any)._carouselLeftInterval = interval;
											}}
											onMouseUp={() => { clearInterval((window as any)._carouselLeftInterval); }}
											onMouseLeave={() => { clearInterval((window as any)._carouselLeftInterval); }}
											onTouchStart={() => {
												const el = carouselRef.current;
												if (!el) return;
												const interval = setInterval(() => {
													el.scrollBy({ left: -30, behavior: 'auto' });
												}, 16);
												(window as any)._carouselLeftInterval = interval;
											}}
											onTouchEnd={() => { clearInterval((window as any)._carouselLeftInterval); }}
											tabIndex={-1}
											aria-label="Scroll left"
											disabled={!canScrollLeft}
										>
											&#8592;
										</button>
													<div
														ref={carouselRef}
														id="projetos-carousel"
														className="flex items-center flex-row gap-4 overflow-x-auto scrollbar-hide w-full h-full px-8 box-border"
														style={{ scrollBehavior: 'smooth', minHeight: 0, minWidth: 0, maxWidth: '100%', maxHeight: '100%' }}
													>
														{projetosFiltrados.length === 0 ? <div className="w-full text-center">Nenhum projeto encontrado.</div> : (
															projetosFiltrados.map(projeto => (
																<div key={projeto.id} className="flex-shrink-0 h-full flex items-center" style={{ width: `${cardWidth}px`}}>
																<ProjetoCarouselCard
																		projeto={projeto}
																		usuarios={usuarios}
																		onClick={() => setSelectedProjeto(projeto)}
																	/>
																</div>
															))
														)}
													</div>
										<button
											type="button"
											className="absolute right-1 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-blue-100 border border-gray-300 rounded-full p-1 shadow transition disabled:opacity-30"
											style={{ display: projetosFiltrados.length > 0 ? 'flex' : 'none', alignItems: 'center', justifyContent: 'center' }}
											onClick={() => {
												const el = carouselRef.current;
												if (el) el.scrollBy({ left: cardWidth, behavior: 'smooth' });
											}}
											onMouseDown={() => {
												const el = carouselRef.current;
												if (!el) return;
												const interval = setInterval(() => {
													el.scrollBy({ left: 30, behavior: 'auto' });
												}, 16);
												(window as any)._carouselRightInterval = interval;
											}}
											onMouseUp={() => { clearInterval((window as any)._carouselRightInterval); }}
											onMouseLeave={() => { clearInterval((window as any)._carouselRightInterval); }}
											onTouchStart={() => {
												const el = carouselRef.current;
												if (!el) return;
												const interval = setInterval(() => {
													el.scrollBy({ left: 30, behavior: 'auto' });
												}, 16);
												(window as any)._carouselRightInterval = interval;
											}}
											onTouchEnd={() => { clearInterval((window as any)._carouselRightInterval); }}
											tabIndex={-1}
											aria-label="Scroll right"
											disabled={!canScrollRight}
										>
											&#8594;
										</button>
									</div>
								)}
				<ProjetoDetailModal
					projeto={selectedProjeto}
					usuarios={usuarios}
					open={!!selectedProjeto}
					canEditProjeto={false}
					onClose={() => setSelectedProjeto(null)}
					onAddEtapa={() => {}}
					onSelectEtapa={() => {}}
					onUpdateProjeto={() => {}}
					onUpdateEtapa={() => {}}
					onDeleteEtapa={() => {}}
				/>
			</div>
		);
	};

export default ProjetosWidget;
