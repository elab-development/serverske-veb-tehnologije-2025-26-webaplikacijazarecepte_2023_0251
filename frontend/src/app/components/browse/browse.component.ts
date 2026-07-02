import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { SidebarComponent, SidebarItem } from '../../common/sidebar/sidebar.component';
import { CardComponent } from '../../common/card/card.component';
import { Recipe } from '../../common/card/card.component';
import { RecipeService } from '../../common/recipe.service';

@Component({
  selector: 'app-browse',
  imports: [CommonModule, CardComponent, SidebarComponent],
  templateUrl: './browse.component.html',
  styleUrl: './browse.component.scss'
})
export class BrowseComponent implements OnInit {
  recipes: Recipe[] = [];
  filteredRecipes: Recipe[] = [];
  paginatedRecipes: Recipe[] = [];
  loading: boolean = false;
  
  isSidebarOpen: boolean = false;
  sidebarItems: SidebarItem[] = [
    { label: 'Profil', route: '/profile' },
    { label: 'Pretraži', route: '/browse' },
    { label: 'Recepti', route: '/recipe' },
    { label: 'Podešavanja', route: '/settings' }
  ];
  
  filters = {
    searchTerm: '',
    taste: '',
    meat: '',
    method: '',
    origin: '',
    maxTime: null as number | null,
    maxWeight: null as number | null
  };
  
  currentPage: number = 1;
  itemsPerPage: number = 6;
  totalPages: number = 0;
  pages: number[] = [];

  constructor(private http: HttpClient, private router: Router, private recipeService: RecipeService) {}

  ngOnInit(): void {
    this.loadRecipes();
  }

  loadRecipes(): void {
    this.loading = true;
    this.recipeService.getAllRecipes().subscribe({
      next: (recipes) => {
        this.recipes = recipes;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading recipes:', error);
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredRecipes = this.recipes.filter(recipe => {
      if (this.filters.searchTerm) {
        const searchTerm = this.filters.searchTerm.toLowerCase();
        const nameMatch = recipe.name.toLowerCase().includes(searchTerm);
        const creatorMatch = recipe.creator.toLowerCase().includes(searchTerm);
        if (!nameMatch && !creatorMatch) {
          return false;
        }
      }

      if (this.filters.taste && recipe.taste !== this.filters.taste) {
        return false;
      }

      if (this.filters.meat && recipe.meat !== this.filters.meat) {
        return false;
      }

      if (this.filters.method && recipe.cookingMethod !== this.filters.method) {
        return false;
      }

      if (this.filters.maxTime !== null && recipe.timeToMake > this.filters.maxTime) {
        return false;
      }

      if (this.filters.maxWeight !== null && recipe.ingredientWeight > this.filters.maxWeight) {
        return false;
      }

      return true;
    });

    this.currentPage = 1;
    this.calculatePagination();
    this.updatePaginatedRecipes();
  }

  calculatePagination(): void {
    this.totalPages = Math.ceil(this.filteredRecipes.length / this.itemsPerPage);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
  }

  updatePaginatedRecipes(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedRecipes = this.filteredRecipes.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedRecipes();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedRecipes();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedRecipes();
    }
  }

  get showingRange(): string {
    if (this.filteredRecipes.length === 0) {
      return 'Nema rezultata';
    }
    
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.filteredRecipes.length);
    return `Prikazuje ${start}-${end} od ${this.filteredRecipes.length} recepata`;
  }

  onFilterChange(filterData: {value: string, filterNumber: number}): void {
    console.log(`Filter ${filterData.filterNumber} changed to:`, filterData.value);
    
    switch (filterData.filterNumber) {
      case 1:
        this.filters.taste = filterData.value;
        break;
      case 2:
        this.filters.meat = filterData.value;
        break;
      case 3:
        this.filters.method = filterData.value;
        break;
      case 4:
        this.filters.origin = filterData.value;
        break;
      case 5:
        this.filters.maxTime = filterData.value ? parseInt(filterData.value) : null;
        break;
      case 6:
        this.filters.maxWeight = filterData.value ? parseFloat(filterData.value) : null;
        break;
    }

    this.applyFilters();
  }

  clearAllFilters(): void {
    this.filters = {
      searchTerm: '',
      taste: '',
      meat: '',
      method: '',
      origin: '',
      maxTime: null,
      maxWeight: null
    };
    this.applyFilters();
  }

  hasActiveFilters(): boolean {
    return this.filters.searchTerm !== '' ||
           this.filters.taste !== '' || 
           this.filters.meat !== '' || 
           this.filters.method !== '' || 
           this.filters.origin !== '' || 
           this.filters.maxTime !== null || 
           this.filters.maxWeight !== null;
  }

  getFilterDisplayValue(filterType: string, value: string): string {
    const displayMaps: { [key: string]: { [key: string]: string } } = {
      taste: {
        'slatko': 'Slatko',
        'slano': 'Slano', 
        'ljuto': 'Ljuto',
        'kiselo': 'Kiselo'
      },
      meat: {
        'piletina': 'Piletina',
        'curetina': 'Ćuretina',
        'svinjetina': 'Svinjetina',
        'govedina': 'Govedina',
        'jagnjetina': 'Jagnjetina',
        'teletina': 'Teletina',
        'riba': 'Riba',
        'morski-plodovi': 'Morski plodovi'
      },
      method: {
        'przeno': 'Prženo',
        'peceno': 'Pečeno',
        'kuvano': 'Kuvano',
        'grilovano': 'Grilovano',
        'dimljeno': 'Dimljeno',
        'dinstano': 'Dinstano',
        'marinado': 'Marinado',
        'bareno': 'Bareno'
      }
    };

    return displayMaps[filterType]?.[value] || value;
  }

  onSidebarItemClick(item: SidebarItem): void {
    if (item.route) {
      this.router.navigate([item.route]);
    }
  }

  onSidebarToggle(isOpen: boolean): void {
    console.log('Sidebar toggled:', isOpen);
    this.isSidebarOpen = isOpen;
  }

  onSearchChange(searchTerm: string): void {
    console.log('Search term changed to:', searchTerm);
    this.filters.searchTerm = searchTerm;
    this.applyFilters();
  }
}
